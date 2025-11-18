import { urlToFile } from "./urlToImage";

/**
 * Dynamically builds FormData from any JS object.
 * Automatically:
 *  - Converts image URLs into File objects.
 *  - Stringifies nested objects/arrays.
 *  - Keeps field names identical to input keys.
 */
export async function objectToFormData(obj) {
  /*
  let test = {
    course_id: 1,
    section_id: 1,
    room_id: 1,
    can_edit: true,
    course: 1,
    section: 1,
    title: "Array Basics",
    description:
      "Questions on array initialization, traversal, and manipulation",
    metadata: {},
    visibility: "PRI",
    is_published: false,
    tasks: [
      {
        task_id: 1,
        point_value: 0,
        tags: ["Easy"],
        components: [
          {
            task_component_id: 1,
            type: "TEXT",
            content: {
              text: "in this lesson you will learn about arrays and complex pointer arithmetic in assembly :)",
            },
          },
        ],
      },
      {
        task_id: 2,
        point_value: 1,
        tags: ["Medium"],
        components: [
          {
            task_component_id: 2,
            type: "TEXT",
            content: {
              text: "vim and reddit son or linked in warrior daughter?",
            },
          },
        ],
      },
    ],
    creator: "testuser",
    created_on: "2025-10-30T05:56:54.985400Z",
    image: "http://127.0.0.1:8000/Icons/image_2025-10-30_005651897.png",
    badge: {
      badge_id: 4,
      image: "http://127.0.0.1:8000/badges/image_2025-10-30_004653651.png",
      title: "Array basics badge",
    },
  };
  for test
  obj = test;
  */
  return recObjectToFormData(obj, new FormData(), null);
}

// helper: recursively resolve nested image URLs inside objects
async function objectToSerializable(obj) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;

    if (
      typeof v === "string" &&
      v.startsWith("http") &&
      /\.(png|jpg|jpeg|gif|webp)$/i.test(v)
    ) {
      try {
        result[k] = await urlToFile(v);
      } catch {
        result[k] = v;
      }
    } else if (Array.isArray(v)) {
      result[k] = await Promise.all(
        v.map(async (item) =>
          typeof item === "object" && item !== null
            ? await objectToSerializable(item)
            : item
        )
      );
    } else if (typeof v === "object") {
      result[k] = await objectToSerializable(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

/**
 * Recursively converts a JS object into FormData, flattening File/Image fields to top-level
 * and keeping all other nested objects/arrays JSON-stringified.
 */
export async function recObjectToFormData(obj, formData = new FormData(), parentKey = null) {
  const serializableObj = await objectToSerializable(obj);

  for (const [key, value] of Object.entries(serializableObj)) {
    if (value === null || value === undefined) continue;

    // Flattened key for top-level FormData field
    const formKey = parentKey ? `${parentKey}_${key}` : key;

    // If it's a File/Blob, append directly at top-level
    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value);
    }
    // If it's an array or object, append as JSON
    else if (Array.isArray(value) || typeof value === "object") {
      formData.append(formKey, JSON.stringify(value));
    }
    // Primitive values
    else {
      formData.append(formKey, String(value));
    }
  }

  return formData;
}