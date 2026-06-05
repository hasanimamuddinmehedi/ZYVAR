import Swal from "sweetalert2";

const zyvarTheme = {
  background: "#0A0A0A",
  color: "#FFFFFF",
  confirmButtonColor: "#C6922B",
  cancelButtonColor: "#dc2626",
};

export const successAlert = (
  title,
  text
) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    ...zyvarTheme,
  });
};

export const errorAlert = (
  title,
  text
) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    ...zyvarTheme,
  });
};

export const warningAlert = (
  title,
  text
) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    ...zyvarTheme,
  });
};

export const confirmAlert = (
  title,
  text
) => {
  return Swal.fire({
    title,
    text,
    icon: "question",

    showCancelButton: true,

    confirmButtonText:
      "Yes",

    cancelButtonText:
      "Cancel",

    ...zyvarTheme,
  });
};