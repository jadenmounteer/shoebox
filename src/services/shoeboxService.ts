import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { getShoeboxImages, deleteImage } from "./imageService";

export interface Shoebox {
  id: string;
  name: string;
  description: string;
  userId: string;
  imageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createShoebox = async (
  userId: string,
  data: { name: string; description: string }
): Promise<Shoebox> => {
  const shoeboxData = {
    ...data,
    userId,
    imageCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, "shoeboxes"), shoeboxData);
  return {
    id: docRef.id,
    ...shoeboxData,
    createdAt: shoeboxData.createdAt.toDate(),
    updatedAt: shoeboxData.updatedAt.toDate(),
  };
};

export const updateShoebox = async (
  shoeboxId: string,
  data: Partial<Shoebox>
): Promise<void> => {
  const shoeboxRef = doc(db, "shoeboxes", shoeboxId);
  await updateDoc(shoeboxRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteShoebox = async (shoeboxId: string): Promise<void> => {
  // First, get all images in the shoebox
  const images = await getShoeboxImages(shoeboxId);

  // Delete each image (this will handle both Storage and Firestore cleanup)
  for (const image of images) {
    await deleteImage(shoeboxId, image.id, image.url);
  }

  // Finally, delete the shoebox document
  const shoeboxRef = doc(db, "shoeboxes", shoeboxId);
  await deleteDoc(shoeboxRef);
};

export const getUserShoeboxes = async (userId: string): Promise<Shoebox[]> => {
  const q = query(collection(db, "shoeboxes"), where("userId", "==", userId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Shoebox;
  });
};
