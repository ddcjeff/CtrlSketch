# Adding Images to the Parts Browser

This guide explains how to add images to parts in the graphical parts browser view.

## Method 1: Add Images to the CSV File

1. Open your CSV file (e.g., `PartList_Haystack.csv`)
2. Add a new column called `image_url` to the CSV file
3. For each part, add the URL or path to the image in this column
4. Save the CSV file

Example CSV with image URLs:
```
item_id,part_number,manufacturer,brand,category,type,price_1,price_2,price_3,description,ignore,cut_sheet,haystack,image_url
96358.0,NPB-8000-2X-485,TRIDIUM,ACTIVE LOGIX,CONTROLLER,JACE,$102.18,$1.00,$102.18,DUAL CARD. Gives to additional MSTP / RS-485 Ports to a Jace Controller.,,C:\Work\CutSheets\95-7778.pdf,"{'controller': True, 'point': True}",/images/parts/jace-card.jpg
```

## Method 2: Add Images to the Public Folder

1. Create a folder for your part images in the public directory:
   ```
   c:/Jeff/CtrlSketch_Beta1/public/images/parts/
   ```

2. Add your part images to this folder with filenames that match the part numbers:
   ```
   NPB-8000-2X-485.jpg
   IO-R-16.jpg
   IO-R-34.jpg
   ```

3. The application will automatically look for images with matching filenames.

## Method 3: Use Online Image URLs

If you have images hosted online, you can use their URLs directly:

1. Open your CSV file
2. Add the `image_url` column
3. Add full URLs to the images:
   ```
   https://example.com/images/parts/NPB-8000-2X-485.jpg
   ```

## Image Requirements

- **Format**: JPG, PNG, or GIF
- **Size**: Recommended 300x300 pixels or larger
- **Aspect Ratio**: Square or 4:3 recommended
- **File Size**: Keep under 200KB for optimal performance

## Troubleshooting

If images are not displaying:

1. Check that the image path or URL is correct
2. Verify that the image file exists in the specified location
3. Make sure the image format is supported (JPG, PNG, GIF)
4. Check browser console for any errors related to image loading
5. If using relative paths, ensure they are relative to the public folder

## Example Implementation

The following code in `PartsBrowserGrid.vue` handles the display of part images:

```html
<div class="part-image">
  <img v-if="part.ImageUrl" :src="part.ImageUrl" :alt="part.Description" class="part-img" />
  <span v-else class="part-icon">{{ getPartIcon(part.Class) }}</span>
</div>
```

This code will display the image if `ImageUrl` is available, otherwise it will show an icon based on the part's class.