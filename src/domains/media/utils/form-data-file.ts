export function getUploadFileFromFormData(
  formData: FormData,
  fieldName = "file",
): File | null {
  const entry = formData.get(fieldName);

  if (entry == null || typeof entry === "string") {
    return null;
  }

  if (typeof entry === "object" && "arrayBuffer" in entry) {
    return entry as File;
  }

  return null;
}
