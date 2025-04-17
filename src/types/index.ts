export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface Shoebox {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Memory {
  id: string;
  shoeboxId: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: Date;
  userId: string;
}
