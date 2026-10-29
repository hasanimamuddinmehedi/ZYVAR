import axios from "axios";
import { auth } from "../firebase/firebase";

const CLOUD_NAME = "dhppdatrl";
const UPLOAD_PRESET = "zyvar_upload";
const DELETE_API =
  import.meta.env.VITE_CLOUDINARY_API_URL ||
  "https://zyvar-email-server.onrender.com/api/cloudinary";

const isCloudinaryImage = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    return (
      url.hostname === "res.cloudinary.com" &&
      url.pathname.startsWith(`/${CLOUD_NAME}/image/upload/`)
    );
  } catch {
    return false;
  }
};

export const uploadImage = async (imageFile) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in before uploading an image.");
  }

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `zyvar/${user.uid}`);
  formData.append("public_id_prefix", `zyvar/${user.uid}`);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
    );
    if (!response.data?.secure_url) {
      throw new Error("Cloudinary did not return an image URL.");
    }
    return response.data.secure_url;
  } catch (error) {
    const message =
      error.response?.data?.error?.message || error.message;
    throw new Error(`Image upload failed: ${message}`, { cause: error });
  }
};

export const deleteImage = async (imageUrl, authorizationToken) => {
  if (!isCloudinaryImage(imageUrl)) return;

  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in again before deleting an image.");
  }

  const token = await user.getIdToken();
  await axios.post(
    `${DELETE_API}/delete`,
    { imageUrl, authorizationToken },
    { headers: { Authorization: `Bearer ${token}` } },
  );
};

export const authorizeImageDeletion = async (imageUrl, resource) => {
  if (!isCloudinaryImage(imageUrl)) return null;

  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in again before deleting an image.");
  }

  if (new URL(imageUrl).pathname.includes(`/zyvar/${user.uid}/`)) {
    return null;
  }

  const token = await user.getIdToken();
  try {
    const response = await axios.post(
      `${DELETE_API}/authorize`,
      { imageUrl, resource },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data.authorizationToken;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(
        "Cloudinary authorization endpoint is not deployed; image cleanup will be retried after saving.",
      );
      return null;
    }
    throw error;
  }
};