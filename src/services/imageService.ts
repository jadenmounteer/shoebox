import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

interface ImageUploadOptions {
  userId: string;
  shoeboxId: string;
  file: File;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const uploadImage = async ({
  userId,
  shoeboxId,
  file,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8,
}: ImageUploadOptions): Promise<string> => {
  // Create a canvas to resize the image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  // Load the image
  const img = new Image();
  const imgLoadPromise = new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
  img.src = URL.createObjectURL(file);
  await imgLoadPromise;

  // Calculate new dimensions while maintaining aspect ratio
  let width = img.width;
  let height = img.height;
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  // Resize the image
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to compressed JPEG
  const compressedBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
  });

  // Generate a unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const storageRef = ref(
    storage,
    `users/${userId}/shoeboxes/${shoeboxId}/${filename}`
  );

  // Upload the compressed image
  await uploadBytes(storageRef, compressedBlob);

  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
