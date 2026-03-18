const defaultWorkingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const defaultTimeSlots = [
  { label: "08:00–09:00", type: "period" },
  { label: "09:00–10:00", type: "period" },
  { label: "10:00–11:00", type: "period" },
  { label: "11:00–12:00", type: "period" },
  { label: "RECESS", type: "break" },
  { label: "12:30–01:30", type: "period" },
  { label: "01:30–02:30", type: "period" },
  { label: "SHORT BREAK", type: "break" },
  { label: "02:45–03:45", type: "period" },
  { label: "03:45–04:45", type: "period" }
];

const buildScheduleGrid = (days, timeSlots) => {
  const grid = {};
  days.forEach((day) => {
    grid[day] = timeSlots.map((slot) => {
      if (slot.type === "break") {
        return { isBreak: true, label: slot.label };
      }
      return null;
    });
  });
  return grid;
};

const normalizeSlotLabel = (slot, periodLabels) => {
  if (!slot) return null;
  const trimmed = String(slot).trim();
  const slotMatch = trimmed.match(/slot\s*(\d+)/i);
  if (slotMatch) {
    const index = Number(slotMatch[1]) - 1;
    return periodLabels[index] || null;
  }
  const normalized = trimmed.replace(/\s*-\s*/g, "–");
  if (periodLabels.includes(normalized)) return normalized;
  return null;
};

const buildAvailabilityMap = (availability, days, periodLabels) => {
  const map = {};
  days.forEach((day) => {
    map[day] = new Set(periodLabels);
  });
  if (!availability || availability.length === 0) return map;

  days.forEach((day) => {
    map[day] = new Set();
  });

  availability.forEach((entry) => {
    const day = entry.day;
    if (!map[day]) return;
    (entry.slots || []).forEach((slot) => {
      const label = normalizeSlotLabel(slot, periodLabels);
      if (label) map[day].add(label);
    });
  });

  return map;
};

const isSlotAllowed = (availabilityMap, day, slotLabel) => {
  if (!availabilityMap || !availabilityMap[day]) return false;
  return availabilityMap[day].has(slotLabel);
};

const markBusy = (tracker, day, slotLabel, id) => {
  if (!tracker[day]) tracker[day] = {};
  if (!tracker[day][slotLabel]) tracker[day][slotLabel] = new Set();
  tracker[day][slotLabel].add(id);
};

const unmarkBusy = (tracker, day, slotLabel, id) => {
  const set = tracker[day]?.[slotLabel];
  if (!set) return;
  set.delete(id);
  if (set.size === 0) {
    delete tracker[day][slotLabel];
  }
};

const createPrintable = ({ schedule, classInfo, academicYear, semester }) => {
  const days = schedule.days.map((day) => ({
    day,
    periods: schedule.slots.map((slotLabel, idx) => {
      const entry = schedule.grid[day][idx];
      if (entry?.isBreak) {
        return { time: slotLabel, type: "break", label: entry.label };
      }
      if (!entry) {
        return { time: slotLabel, type: "free", subject: "-" };
      }
      return {
        time: slotLabel,
        subject: entry.subjectName,
        teacher: entry.teacherName,
        room: entry.roomName || entry.labName || "-",
        type: entry.type
      };
    })
  }));

  const staffMap = {};
  schedule.days.forEach((day) => {
    schedule.grid[day].forEach((entry) => {
      if (!entry || entry.isBreak) return;
      staffMap[entry.subjectName] = {
        subject: entry.subjectName,
        teacher: entry.teacherName,
        type: entry.type
      };
    });
  });

  return {
    institutionName: process.env.INSTITUTION_NAME || "Smart Timetable Generator System",
    academicYear,
    semester,
    className: classInfo?.className || "Class",
    days,
    staffTable: Object.values(staffMap)
  };
};

export const generateTimetable = ({
  days,
  subjects,
  teachers,
  rooms,
  labs,
  classMap,
  maxLecturesPerDay,
  roomRules,
  labRules,
  fixedRoomId,
  fixedLabId,
  academicYear,
  semester
}) => {
  const workingDays = days && days.length ? days : defaultWorkingDays;
  const timeSlots = defaultTimeSlots;
  const periodLabels = timeSlots.filter((slot) => slot.type === "period").map((slot) => slot.label);

  const schedule = {
    days: workingDays,
    slots: timeSlots.map((slot) => slot.label),
    grid: buildScheduleGrid(workingDays, timeSlots),
    periods: timeSlots
  };

  const invalidPracticals = subjects.filter(
    (subject) => subject.type === "practical" && subject.hoursPerWeek % 2 !== 0
  );
  if (invalidPracticals.length > 0) {
    return {
      schedule: null,
      unassigned: invalidPracticals.map((s) => ({
        subjectId: String(s._id),
        subjectName: s.subjectName,
        reason: "Practical hours must be even for double periods"
      })),
      error: "Invalid practical hours"
    };
  }

  const teacherMap = new Map(teachers.map((t) => [String(t._id), t]));
  const roomMap = new Map(rooms.map((r) => [String(r._id), r]));
  const labMap = new Map(labs.map((l) => [String(l._id), l]));

  const teacherAvailability = new Map();
  const roomAvailability = new Map();
  const labAvailability = new Map();

  teachers.forEach((teacher) =>
    teacherAvailability.set(
      String(teacher._id),
      buildAvailabilityMap(teacher.availability, workingDays, periodLabels)
    )
  );
  rooms.forEach((room) =>
    roomAvailability.set(
      String(room._id),
      buildAvailabilityMap(room.availability, workingDays, periodLabels)
    )
  );
  labs.forEach((lab) =>
    labAvailability.set(
      String(lab._id),
      buildAvailabilityMap(lab.availability, workingDays, periodLabels)
    )
  );

  const teacherBusy = {};
  const roomBusy = {};
  const labBusy = {};
  const classDailyCount = {};
  const teacherDailyCount = {};
  const subjectDailyCount = {};

  workingDays.forEach((day) => {
    classDailyCount[day] = {};
    teacherDailyCount[day] = {};
    subjectDailyCount[day] = {};
  });

  const periodIndices = timeSlots
    .map((slot, idx) => (slot.type === "period" ? idx : null))
    .filter((idx) => idx !== null);

  const doubleStartIndices = periodIndices.filter(
    (idx) => timeSlots[idx + 1] && timeSlots[idx + 1].type === "period"
  );

  const pickRoomForSlots = (slotLabels, day, classInfo) => {
    const capacityStrict = roomRules?.capacityStrict ?? true;
    const preferredRooms = fixedRoomId ? [roomMap.get(String(fixedRoomId))] : rooms;
    const candidates = preferredRooms
      .filter(Boolean)
      .filter((room) => {
        const roomId = String(room._id);
        if (capacityStrict && classInfo && room.capacity < classInfo.studentCount) return false;
        return slotLabels.every((label) => {
          if (!isSlotAllowed(roomAvailability.get(roomId), day, label)) return false;
          return !roomBusy[day]?.[label]?.has(roomId);
        });
      })
      .sort((a, b) => (a.capacity || 0) - (b.capacity || 0) || a.roomName.localeCompare(b.roomName));

    return candidates[0] || null;
  };

  const pickLabForSlots = (slotLabels, day, classInfo) => {
    const capacityStrict = labRules?.capacityStrict ?? false;
    const preferredLabs = fixedLabId ? [labMap.get(String(fixedLabId))] : labs;
    const candidates = preferredLabs
      .filter(Boolean)
      .filter((lab) => {
        const labId = String(lab._id);
        if (capacityStrict && classInfo && lab.capacity < classInfo.studentCount) return false;
        return slotLabels.every((label) => {
          if (!isSlotAllowed(labAvailability.get(labId), day, label)) return false;
          return !labBusy[day]?.[label]?.has(labId);
        });
      })
      .sort((a, b) => a.labName.localeCompare(b.labName));

    return candidates[0] || null;
  };

  const sessions = [];
  subjects.forEach((subject) => {
    if (subject.type === "practical") {
      const blocks = subject.hoursPerWeek / 2;
      for (let i = 0; i < blocks; i += 1) {
        sessions.push({ subject, duration: 2 });
      }
    } else {
      for (let i = 0; i < subject.hoursPerWeek; i += 1) {
        sessions.push({ subject, duration: 1 });
      }
    }
  });

  sessions.forEach((session) => {
    const teacher = teacherMap.get(String(session.subject.teacher));
    const availability = teacher ? teacherAvailability.get(String(teacher._id)) : null;
    const indices = session.duration === 2 ? doubleStartIndices : periodIndices;
    session.candidates = [];
    workingDays.forEach((day) => {
      indices.forEach((startIndex) => {
        const slotLabels =
          session.duration === 2
            ? [timeSlots[startIndex].label, timeSlots[startIndex + 1].label]
            : [timeSlots[startIndex].label];
        if (availability) {
          const allowed = slotLabels.every((label) => isSlotAllowed(availability, day, label));
          if (!allowed) return;
        }
        session.candidates.push({ day, startIndex, slotLabels });
      });
    });
  });

  sessions.sort((a, b) => {
    if (a.subject.type !== b.subject.type) return a.subject.type === "practical" ? -1 : 1;
    if (a.candidates.length !== b.candidates.length) return a.candidates.length - b.candidates.length;
    if (a.subject.hoursPerWeek !== b.subject.hoursPerWeek) return b.subject.hoursPerWeek - a.subject.hoursPerWeek;
    return a.subject.subjectName.localeCompare(b.subject.subjectName);
  });

  const unassigned = [];

  const dayOrder = new Map(workingDays.map((day, idx) => [day, idx]));

  const placeSession = (index) => {
    if (index >= sessions.length) return true;

    const session = sessions[index];
    const subject = session.subject;
    const teacherId = String(subject.teacher);
    const subjectId = String(subject._id);
    const classId = String(subject.class);
    const classInfo = classMap.get(classId);

    const candidates = [...session.candidates].sort((a, b) => {
      const classCountA = classDailyCount[a.day][classId] || 0;
      const classCountB = classDailyCount[b.day][classId] || 0;
      if (classCountA !== classCountB) return classCountA - classCountB;
      if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
      return (dayOrder.get(a.day) || 0) - (dayOrder.get(b.day) || 0);
    });

    for (const candidate of candidates) {
      const { day, startIndex, slotLabels } = candidate;
      const slotIndices = session.duration === 2 ? [startIndex, startIndex + 1] : [startIndex];

      if (slotIndices.some((idx) => schedule.grid[day][idx])) continue;

      const teacher = teacherMap.get(teacherId);
      const teacherCount = teacherDailyCount[day][teacherId] || 0;
      if (teacher && teacher.maxLecturesPerDay && teacherCount + session.duration > teacher.maxLecturesPerDay) {
        continue;
      }

      if (maxLecturesPerDay && classInfo) {
        const classCount = classDailyCount[day][classId] || 0;
        if (classCount + session.duration > maxLecturesPerDay) continue;
      }

      const subjectCount = subjectDailyCount[day][subjectId] || 0;
      const classCountBefore = classInfo ? classDailyCount[day][classId] || 0 : 0;
      if (subjectCount + session.duration > 2) {
        continue;
      }

      if (slotLabels.some((label) => teacherBusy[day]?.[label]?.has(teacherId))) continue;

      let room = null;
      let lab = null;
      if (subject.type === "practical") {
        lab = pickLabForSlots(slotLabels, day, classInfo);
        if (!lab) continue;
      } else {
        room = pickRoomForSlots(slotLabels, day, classInfo);
        if (!room) continue;
      }

      slotIndices.forEach((idx) => {
        schedule.grid[day][idx] = {
          subjectId: subjectId,
          subjectName: subject.subjectName,
          teacherId: teacher ? teacherId : null,
          teacherName: teacher ? teacher.name : "TBD",
          roomId: room ? String(room._id) : null,
          roomName: room ? room.roomName : null,
          labId: lab ? String(lab._id) : null,
          labName: lab ? lab.labName : null,
          classId: classInfo ? String(classInfo._id) : null,
          className: classInfo ? classInfo.className : null,
          type: subject.type
        };
      });

      slotLabels.forEach((label) => {
        markBusy(teacherBusy, day, label, teacherId);
        if (room) markBusy(roomBusy, day, label, String(room._id));
        if (lab) markBusy(labBusy, day, label, String(lab._id));
      });

      teacherDailyCount[day][teacherId] = teacherCount + session.duration;
      if (classInfo) {
        classDailyCount[day][classId] = classCountBefore + session.duration;
      }
      subjectDailyCount[day][subjectId] = subjectCount + session.duration;

      if (placeSession(index + 1)) return true;

      slotIndices.forEach((idx) => {
        schedule.grid[day][idx] = null;
      });

      slotLabels.forEach((label) => {
        unmarkBusy(teacherBusy, day, label, teacherId);
        if (room) unmarkBusy(roomBusy, day, label, String(room._id));
        if (lab) unmarkBusy(labBusy, day, label, String(lab._id));
      });

      teacherDailyCount[day][teacherId] = teacherCount;
      if (classInfo) {
        classDailyCount[day][classId] = classCountBefore;
      }
      subjectDailyCount[day][subjectId] = subjectCount;
    }

    return false;
  };

  const success = placeSession(0);
  if (!success) {
    subjects.forEach((subject) => {
      unassigned.push({
        subjectId: String(subject._id),
        subjectName: subject.subjectName,
        reason: "No valid slot found"
      });
    });
    return { schedule: null, unassigned, error: "Unable to generate timetable" };
  }

  const classInfo = classMap.get(String(subjects[0]?.class)) || null;
  schedule.printable = createPrintable({
    schedule,
    classInfo,
    academicYear,
    semester
  });

  return { schedule, unassigned: [] };
};
