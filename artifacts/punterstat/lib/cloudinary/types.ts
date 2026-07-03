export type UploadFolder = "avatars" | "blog" | "thumbnails";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: UploadFolder;
}
