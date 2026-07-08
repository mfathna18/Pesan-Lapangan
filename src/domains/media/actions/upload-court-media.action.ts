"use server";

import { getCourtMediaService } from "@/domains/media/actions/get-court-media-service";
import {
  MediaAuthorizationError,
  MediaStorageError,
  MediaValidationError,
} from "@/domains/media/errors";
import { getUploadFileFromFormData } from "@/domains/media/utils/form-data-file";
import { revalidatePublicVenueForUserId } from "@/domains/owner/utils/revalidate-owner-venue";
import {
  actionFailure,
  actionSuccess,
  type ActionResponse,
} from "@/domains/owner/actions/types";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import {
  createKnownActionError,
  handleServerActionError,
} from "@/lib/server/actions";

const knownMediaErrors = [
  createKnownActionError(MediaValidationError),
  createKnownActionError(MediaStorageError),
  createKnownActionError(MediaAuthorizationError),
];

function getCourtIdFromFormData(formData: FormData): string | null {
  const value = formData.get("courtId");

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export async function uploadCourtImageAction(
  formData: FormData,
): Promise<ActionResponse<{ imageUrls: string[] }>> {
  const session = await requireOwnerSession();
  const courtId = getCourtIdFromFormData(formData);
  const file = getUploadFileFromFormData(formData);

  if (!courtId) {
    return actionFailure("Lapangan tidak valid.");
  }

  if (!file) {
    return actionFailure("Pilih foto lapangan terlebih dahulu.");
  }

  try {
    const imageUrls = await getCourtMediaService().addImage(
      session.user.id,
      courtId,
      file,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ imageUrls });
  } catch (error) {
    return handleServerActionError("uploadCourtImageAction", error, {
      fallbackMessage: "Gagal mengunggah foto lapangan.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function replaceCourtImageAction(
  formData: FormData,
): Promise<ActionResponse<{ imageUrls: string[] }>> {
  const session = await requireOwnerSession();
  const courtId = getCourtIdFromFormData(formData);
  const file = getUploadFileFromFormData(formData);
  const indexValue = formData.get("index");
  const index = Number(indexValue);

  if (!courtId) {
    return actionFailure("Lapangan tidak valid.");
  }

  if (!file) {
    return actionFailure("Pilih foto lapangan terlebih dahulu.");
  }

  if (!Number.isInteger(index) || index < 0) {
    return actionFailure("Foto lapangan tidak valid.");
  }

  try {
    const imageUrls = await getCourtMediaService().replaceImage(
      session.user.id,
      courtId,
      file,
      index,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ imageUrls });
  } catch (error) {
    return handleServerActionError("replaceCourtImageAction", error, {
      fallbackMessage: "Gagal mengganti foto lapangan.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function deleteCourtImageAction(
  courtId: string,
  publicUrl: string,
): Promise<ActionResponse<{ imageUrls: string[] }>> {
  const session = await requireOwnerSession();

  if (!courtId.trim()) {
    return actionFailure("Lapangan tidak valid.");
  }

  try {
    const imageUrls = await getCourtMediaService().deleteImage(
      session.user.id,
      courtId,
      publicUrl,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ imageUrls });
  } catch (error) {
    return handleServerActionError("deleteCourtImageAction", error, {
      fallbackMessage: "Gagal menghapus foto lapangan.",
      knownErrors: knownMediaErrors,
    });
  }
}

export async function reorderCourtImagesAction(
  courtId: string,
  imageUrls: string[],
): Promise<ActionResponse<{ imageUrls: string[] }>> {
  const session = await requireOwnerSession();

  if (!courtId.trim()) {
    return actionFailure("Lapangan tidak valid.");
  }

  try {
    const reordered = await getCourtMediaService().reorderImages(
      session.user.id,
      courtId,
      imageUrls,
    );

    await revalidatePublicVenueForUserId(session.user.id);

    return actionSuccess({ imageUrls: reordered });
  } catch (error) {
    return handleServerActionError("reorderCourtImagesAction", error, {
      fallbackMessage: "Gagal mengatur ulang foto lapangan.",
      knownErrors: knownMediaErrors,
    });
  }
}
