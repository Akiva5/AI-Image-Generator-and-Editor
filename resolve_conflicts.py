import sys

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

output = []
skip = False
in_head = False
in_origin = False
head_content = []
origin_content = []

for line in lines:
    if '<<<<<<< HEAD' in line:
        skip = True
        in_head = True
        continue
    if '=======' in line:
        in_head = False
        in_origin = True
        continue
    if '>>>>>>> origin/main' in line:
        # Merge logic here
        # For the message mapping, we want HEAD (which uses MessageItem)
        # But we also want to make sure MessageItem has the aria-label from origin
        output.extend(head_content)
        skip = False
        in_origin = False
        head_content = []
        origin_content = []
        continue

    if in_head:
        head_content.append(line)
    elif in_origin:
        origin_content.append(line)
    else:
        output.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(output)
