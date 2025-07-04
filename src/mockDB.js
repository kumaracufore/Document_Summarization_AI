export const mockDB = [];

export const saveFileToDb = file => {
  const reader = new FileReader();
  reader.onload = () => {
    mockDB.push({
      name: file.name,
      type: file.type,
      size: file.size,
      content: reader.result,
      uploadedAt: new Date()
    });
    console.log("DB:", mockDB);
  };
  reader.readAsDataURL(file);
};
