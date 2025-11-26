//accuired from the web. Used in case an image isnt provided by backend for backgorunds for pages
const imageList = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc"
];

export function get_random_image_from_list(){
      const randomImage = imageList[Math.floor(Math.random() * imageList.length)];
      return randomImage
}