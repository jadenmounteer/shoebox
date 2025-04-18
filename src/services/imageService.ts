import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { storage, db } from "../config/firebase";

interface ImageUploadOptions {
  userId: string;
  shoeboxId: string;
  file: File;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface Image {
  id: string;
  url: string;
  uploadedAt: Date;
}

export const uploadImage = async ({
  userId,
  shoeboxId,
  file,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8,
}: ImageUploadOptions): Promise<Image> => {
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

  // Store image reference in Firestore
  const imageRef = await addDoc(
    collection(db, `shoeboxes/${shoeboxId}/images`),
    {
      url: downloadURL,
      uploadedAt: Timestamp.now(),
    }
  );

  // Increment the imageCount in the shoebox document
  const shoeboxRef = doc(db, "shoeboxes", shoeboxId);
  await updateDoc(shoeboxRef, {
    imageCount: increment(1),
  });

  return {
    id: imageRef.id,
    url: downloadURL,
    uploadedAt: new Date(),
  };
};

export const getShoeboxImages = async (shoeboxId: string): Promise<Image[]> => {
  const imagesRef = collection(db, `shoeboxes/${shoeboxId}/images`);
  const snapshot = await getDocs(imagesRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    url: doc.data().url,
    uploadedAt: doc.data().uploadedAt.toDate(),
  }));
};

export const deleteImage = async (
  shoeboxId: string,
  imageId: string,
  imageUrl: string
): Promise<void> => {
  // Delete from Storage
  const storageRef = ref(storage, imageUrl);
  await deleteObject(storageRef);

  // Delete from Firestore
  await deleteDoc(doc(db, `shoeboxes/${shoeboxId}/images/${imageId}`));

  // Decrement the imageCount in the shoebox document
  const shoeboxRef = doc(db, "shoeboxes", shoeboxId);
  await updateDoc(shoeboxRef, {
    imageCount: increment(-1),
  });
};
