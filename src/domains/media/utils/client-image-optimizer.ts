import {
  MEDIA_MAX_DIMENSION,
  MEDIA_WEBP_QUALITY,
  type MediaKind,
} from "@/domains/media/constants";

type OptimizeImageFileOptions = {
  file: File;
  kind: MediaKind;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("INVALID_IMAGE"));
    };

    image.src = objectUrl;
  });
}

function canvasToWebpFile(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("OPTIMIZE_FAILED"));
          return;
        }

        const optimizedName = fileName.replace(/\.[^.]+$/, "") || "image";

        resolve(
          new File([blob], `${optimizedName}.webp`, {
            type: "image/webp",
          }),
        );
      },
      "image/webp",
      MEDIA_WEBP_QUALITY / 100,
    );
  });
}

export async function optimizeImageFile({
  file,
  kind,
}: OptimizeImageFileOptions): Promise<File> {
  const image = await loadImageFromFile(file);
  const maxDimension = MEDIA_MAX_DIMENSION[kind];

  const scale = Math.min(
    1,
    maxDimension / image.width,
    maxDimension / image.height,
  );

  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("OPTIMIZE_FAILED");
  }

  context.drawImage(image, 0, 0, width, height);

  return canvasToWebpFile(canvas, file.name);
}
