import { oEmbedResponseSchema } from "../specification.js";

const handleMutation = async () => {
  mutationObserver.disconnect();
  try {
    for (const image of document.querySelectorAll("img")) {
      const imageURLPatternResult = new URLPattern(
        "/images/:imageID",
        import.meta.url,
      ).exec(image.src);
      if (imageURLPatternResult) {
        const { imageID } = imageURLPatternResult.pathname.groups;
        if (!imageID) {
          throw new Error("Invalid image ID");
        }

        const oEmbedURL = new URL(
          `/images/${encodeURIComponent(imageID)}`,
          import.meta.url,
        );
        const oEmbedResponse = await fetch(
          new URL(
            `/oembed?${new URLSearchParams({ url: String(oEmbedURL), format: "json" })}`,
            import.meta.url,
          ),
        );
        if (!oEmbedResponse.ok) {
          throw new Error("Failed to fetch oEmbed");
        }
        const oEmbed = oEmbedResponseSchema.parse(await oEmbedResponse.json());

        const container = document.createElement("div");
        container.innerHTML = oEmbed.html;
        const iframe = container.querySelector("iframe");
        if (!iframe) {
          throw new Error("Invalid oEmbed response");
        }

        for (const attribute of image.attributes) {
          switch (attribute.name) {
            case "src": {
              break;
            }

            case "class":
            case "style": {
              iframe.setAttribute(
                attribute.name,
                `${iframe.getAttribute(attribute.name)} ${attribute.value}`,
              );
              break;
            }

            default: {
              iframe.setAttribute(attribute.name, attribute.value);
              break;
            }
          }
        }

        image.insertAdjacentHTML("afterend", container.innerHTML);
        image.remove();

        continue;
      }
    }
  } finally {
    mutationObserver.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }
};
const mutationObserver = new MutationObserver(handleMutation);
handleMutation();
