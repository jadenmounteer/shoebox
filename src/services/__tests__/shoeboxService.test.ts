import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../config/firebase";
import { deleteShoebox, getUserShoeboxes } from "../../services/shoeboxService";
import { deleteImage, getShoeboxImages } from "../../services/imageService";

// Mock Firebase modules
jest.mock("firebase/firestore");
jest.mock("firebase/storage");
jest.mock("../../config/firebase", () => ({
  db: {},
  storage: {},
}));
jest.mock("../../services/imageService");

describe("Shoebox Service", () => {
  const mockShoebox = {
    id: "shoebox1",
    name: "Test Shoebox",
    description: "Test Description",
    userId: "user123",
    imageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockImage = {
    id: "image1",
    url: "https://example.com/test.jpg",
    uploadedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("deleteShoebox", () => {
    it("should delete a shoebox and all its images", async () => {
      // Mock getShoeboxImages to return test images
      (getShoeboxImages as jest.Mock).mockResolvedValue([
        mockImage,
        { ...mockImage, id: "image2" },
      ]);

      // Mock Firestore operations
      (doc as jest.Mock).mockReturnValue({ id: "shoebox1" });
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      (deleteImage as jest.Mock).mockResolvedValue(undefined);

      // Delete the shoebox
      await deleteShoebox("shoebox1");

      // Verify deleteDoc was called for the shoebox
      expect(deleteDoc).toHaveBeenCalledWith({ id: "shoebox1" });

      // Verify deleteImage was called for each image
      expect(deleteImage).toHaveBeenCalledWith(
        "shoebox1",
        "image1",
        mockImage.url
      );
      expect(deleteImage).toHaveBeenCalledWith(
        "shoebox1",
        "image2",
        mockImage.url
      );
    });

    it("should handle deleting a shoebox with no images", async () => {
      // Mock getShoeboxImages to return empty array
      (getShoeboxImages as jest.Mock).mockResolvedValue([]);

      // Mock Firestore operation
      (doc as jest.Mock).mockReturnValue({ id: "shoebox1" });
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteShoebox("shoebox1");

      // Verify deleteDoc was called
      expect(deleteDoc).toHaveBeenCalledWith({ id: "shoebox1" });

      // Verify deleteImage was not called
      expect(deleteImage).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      // Mock getShoeboxImages to throw error
      (getShoeboxImages as jest.Mock).mockRejectedValue(
        new Error("Test error")
      );

      await expect(deleteShoebox("nonexistent")).rejects.toThrow("Test error");
    });
  });

  describe("getUserShoeboxes", () => {
    it("should return user shoeboxes", async () => {
      // Mock Firestore query operations
      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [
          {
            id: "shoebox1",
            data: () => ({
              ...mockShoebox,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          },
        ],
      });

      const shoeboxes = await getUserShoeboxes("user123");

      expect(shoeboxes).toHaveLength(1);
      expect(shoeboxes[0].id).toBe("shoebox1");
      expect(where).toHaveBeenCalledWith("userId", "==", "user123");
    });
  });
});
