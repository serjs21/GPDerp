export const formatCreatedAt = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export const formatChatTime = (input: Date | number | string) => {
  const d = new Date(input);
  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
  }) + ", " + d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}