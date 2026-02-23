# Windows Disk Shrink Simulator

An educational web-based simulator that replicates the behavior of the Windows "Shrink Volume" feature from Disk Management.

This project helps users understand why Windows cannot shrink a partition beyond certain limits and how NTFS internal constraints affect disk resizing.

⚠️ This tool does NOT modify real disks. It is a visual and educational simulator.

---

## 🎯 Purpose

When using Windows Disk Management, many users are confused by:

- Why the shrinkable space is smaller than the free space.
- Why they cannot reduce the partition beyond a specific limit.
- What prevents Windows from shrinking further.

This simulator visually explains those limitations.

---

## 🖥 How It Works

1. Open Windows Disk Management.
2. Right-click your partition (usually C:).
3. Click "Shrink Volume".
4. Copy these two values:

   - Total size before shrink (MB)
   - Size of available shrink space (MB)

5. Enter those values into the simulator.

The tool automatically calculates:

- Maximum shrink allowed
- Final partition size
- Visual disk representation

---

## 🎚 Partition Divider Logic

The visual divider represents the shrink value.

You can:

- Click and drag the divider to the right.
- It cannot move beyond the maximum allowed shrink.

This behavior replicates how Windows enforces shrink limits.

---

## 📋 Copy Button

The simulator includes a "Copy" button next to:

> Size of space to shrink (MB)

This allows you to copy the exact value and paste it directly into Windows.

---

## 🧠 Why Windows Limits Shrinking

Windows cannot shrink beyond the last unmovable file on disk.

Examples of unmovable data:

- pagefile.sys
- hiberfil.sys
- NTFS metadata
- Master File Table (MFT)
- System restore data

Even if free space exists, it may not be contiguous.

---

## 📱 Responsive Design

- Desktop: Two-column layout
- Mobile: Single-column layout

---

## 🛠 Built With

- HTML
- CSS
- JavaScript
- Clipboard API

No backend required.

---

## 📚 Educational Value

This tool is particularly useful for:

- Users preparing for dual boot installation
- Linux beginners
- Students learning about filesystems
- Developers studying NTFS behavior

---

## 🚀 Live Demo

https://wachin.github.io/windows-disk-shrink-simulator/

---

## License

Educational use. Free to modify and distribute.