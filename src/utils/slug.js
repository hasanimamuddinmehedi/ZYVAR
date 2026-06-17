export const generateSlug =
  (shopName) => {

    return shopName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  };