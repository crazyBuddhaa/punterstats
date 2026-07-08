export type UploadFolder = "avatars" | "blog" | "thumbnails" | "lesson-images";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: UploadFolder;
}
