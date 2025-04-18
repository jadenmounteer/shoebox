import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

const mockShoebox = {
  name: "Test Shoebox",
  description: "Test Description",
  imageCount: 0,
  userId: "user123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Firestore Security Rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "shoebox-test",
      firestore: {
        host: "localhost",
        port: 8080,
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              match /shoeboxes/{shoeboxId} {
                allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
                allow create: if request.auth != null 
                  && request.resource.data.userId == request.auth.uid
                  && request.resource.data.name is string
                  && request.resource.data.name.size() > 0
                  && request.resource.data.description is string
                  && request.resource.data.imageCount is number;
              }
              match /{document=**} {
                allow read, write: if false;
              }
            }
          }
        `,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe("Shoebox Collection", () => {
    test("allows users to create their own shoeboxes with valid data", async () => {
      const authenticatedContext = testEnv.authenticatedContext("user123");
      const db = authenticatedContext.firestore();

      const newShoebox = {
        ...mockShoebox,
        userId: "user123",
      };

      await assertSucceeds(
        setDoc(doc(db, "shoeboxes", "shoebox1"), newShoebox)
      );
    });

    test("prevents users from creating shoeboxes with invalid data", async () => {
      const authenticatedContext = testEnv.authenticatedContext("user123");
      const db = authenticatedContext.firestore();

      const invalidShoebox = {
        ...mockShoebox,
        userId: "user123",
        name: "", // Invalid: empty name
      };

      await assertFails(
        setDoc(doc(db, "shoeboxes", "shoebox1"), invalidShoebox)
      );
    });

    test("allows users to read their own shoeboxes", async () => {
      // Setup: Create a shoebox
      const adminDb = testEnv.unauthenticatedContext().firestore();
      await setDoc(doc(adminDb, "shoeboxes", "shoebox1"), mockShoebox);

      // Test: Read as owner
      const ownerContext = testEnv.authenticatedContext("user123");
      const ownerDb = ownerContext.firestore();

      await assertSucceeds(getDoc(doc(ownerDb, "shoeboxes", "shoebox1")));
    });

    test("prevents users from reading other users shoeboxes", async () => {
      // Setup: Create a shoebox
      const adminDb = testEnv.unauthenticatedContext().firestore();
      await setDoc(doc(adminDb, "shoeboxes", "shoebox1"), mockShoebox);

      // Test: Read as different user
      const otherUserContext = testEnv.authenticatedContext("user456");
      const otherUserDb = otherUserContext.firestore();

      await assertFails(getDoc(doc(otherUserDb, "shoeboxes", "shoebox1")));
    });

    test("allows users to update their own shoeboxes", async () => {
      // Setup: Create a shoebox
      const adminDb = testEnv.unauthenticatedContext().firestore();
      await setDoc(doc(adminDb, "shoeboxes", "shoebox1"), mockShoebox);

      // Test: Update as owner
      const ownerContext = testEnv.authenticatedContext("user123");
      const ownerDb = ownerContext.firestore();

      await assertSucceeds(
        updateDoc(doc(ownerDb, "shoeboxes", "shoebox1"), {
          name: "Updated Name",
        })
      );
    });

    test("prevents users from updating other users shoeboxes", async () => {
      // Setup: Create a shoebox
      const adminDb = testEnv.unauthenticatedContext().firestore();
      await setDoc(doc(adminDb, "shoeboxes", "shoebox1"), mockShoebox);

      // Test: Update as different user
      const otherUserContext = testEnv.authenticatedContext("user456");
      const otherUserDb = otherUserContext.firestore();

      await assertFails(
        updateDoc(doc(otherUserDb, "shoeboxes", "shoebox1"), {
          name: "Updated Name",
        })
      );
    });

    test("prevents unauthenticated access", async () => {
      const unauthenticatedContext = testEnv.unauthenticatedContext();
      const db = unauthenticatedContext.firestore();

      await assertFails(getDoc(doc(db, "shoeboxes", "shoebox1")));
    });
  });
});
