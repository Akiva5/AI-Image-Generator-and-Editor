import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Download image button
content = content.replace(
    '<Button \n                              variant="secondary"',
    '<Button \n                              aria-label="Download image"\n                              variant="secondary"'
)

# 2. Remove image button
content = content.replace(
    '<button \n                        onClick={() => setAttachedImage(null)}',
    '<button \n                        aria-label="Remove image"\n                        onClick={() => setAttachedImage(null)}'
)

# 3. Select photo button in Google Photos dialog
content = content.replace(
    '<button\n                                  key={photo.id}\n                                  onClick={() => selectGooglePhoto(photo)}',
    '<button\n                                  aria-label={`Select photo ${photo.filename}`}\n                                  key={photo.id}\n                                  onClick={() => selectGooglePhoto(photo)}'
)

# 5. Attach local image button
content = content.replace(
    '<Button \n                        variant="ghost" \n                        size="icon" \n                        className="rounded-full h-10 w-10 shrink-0"\n                        onClick={() => fileInputRef.current?.click()}',
    '<Button \n                        aria-label="Attach local image"\n                        variant="ghost" \n                        size="icon" \n                        className="rounded-full h-10 w-10 shrink-0"\n                        onClick={() => fileInputRef.current?.click()}'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
