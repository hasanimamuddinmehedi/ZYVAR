import { Helmet }
from "react-helmet-async";

export default function SEO({

  title,
  description,
  image,
}) {

  return (

    <Helmet>

      <title>
        {title}
      </title>

      <meta
        name="description"
        content={description}
      />

      {/* Open Graph */}
      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:image"
        content={image}
      />

      <meta
        property="og:type"
        content="website"
      />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={image}
      />

    </Helmet>
  );
}