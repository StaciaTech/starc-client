export const getEmbedUrl = (url: string): string => {
  if (!url) return "";
  try {
    if (url.includes("drive.google.com")) {
      let id = "";
      const parts = url.split("/");
      if (url.includes("/file/d/")) {
        const idx = parts.indexOf("d");
        if (idx !== -1 && parts[idx + 1]) id = parts[idx + 1];
      } else if (url.includes("id=")) {
        id = url.split("id=")[1].split("&")[0];
      }
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
    }
    return url;
  } catch (e) {
    return url;
  }
};
