# Disk Shrink Simulator (Windows)

This simulator was created to help you understand what happens before touching something important on your computer.
Changing partitions without understanding what is happening can be risky.
Here you can learn safely.

This is an educational tool that simulates the behavior of the **“Shrink Volume”** window from Windows Disk Management.

This project was created to help understand how Windows calculates shrinkable space before installing Linux or creating new partitions.

⚠️ **Important:**
This page does **NOT modify real disks**. It is only a visual and educational simulation.

---

## 🧩 What Is a Partition?

A partition is a division of your hard drive.

It is like having a large cake and cutting it into pieces.
Each piece can be used for something different:

* One part for Windows
* Another part for Linux
* Another part for storing files

When you shrink a volume, you are making one of those pieces smaller to create new space.

---

## Objective

When Windows shows the **“Shrink Volume (C:)”** window, many people do not understand:

* Why they cannot shrink all the free space.
* Why there is a limit that cannot be exceeded.
* What “non-shrinkable” space means.

This simulator reproduces that behavior so you can understand it before making real changes to your disk.

---

## 🖥️ How to Use the Simulator

### Step 1 — Open Windows Disk Management

On your computer:

1. Press `Win + X`
2. Select **Disk Management**
3. Right-click on the **Windows (C:)** partition
4. Select **Shrink Volume…**

Windows will display a window with 3 important values.

---

### Step 2 — Copy the First Two Values

You must copy **exactly** (in MB and without commas or periods):

* ✅ **Total size before shrink**
* ✅ **Size of available shrink space**

Enter those two values into the web simulator.

---

### Step 3 — Understand the Disk Bar

After entering the first two values:

On the right side you will see the simulated disk bar.

In that bar you will see:

* 🔵 Blue area → Windows (after shrink)
* ⚪ Gray striped area → Empty space for Linux
* 🎚️ A small slider (divider)

That small control is called:

> **Partition Divider** (or simply *divider* / *handle* in technical terms).

---

## 🎚️ How to Move the Divider Correctly

You must:

1. Click on the divider.
2. Hold the mouse button.
3. Drag it to the right.

❗ You will not be able to move it further to the left beyond the limit (you cannot shrink the allocated space past the point where unmovable files are located).

---

## ❓ Why Can’t It Be Shrunk Further?

Because Windows has already performed its internal calculation.

Windows analyzes the disk and detects files that **cannot be moved**, for example:

* Paging file (pagefile.sys)
* Hibernation file
* System metadata
* Unmovable fragments
* Internal NTFS system structures

That is why a maximum limit appears.

That limit is exactly the value Windows shows as:

> **“Size of available shrink space”**

That number is the maximum Windows allows you to shrink at that moment.

**Unless** you use third-party partition software that can attempt to reduce a volume containing unmovable files (by automatically moving them) through a “Resize Partition” function, such as [AOMEI Partition Assistant](https://www.diskpart.com/es/articles/reducir-volumen-con-archivos-inamovibles-7400-tc.html).

However, for inexperienced users this could be dangerous, and I do not want to encourage people to do things without understanding the risks. I mention this program because I have used it myself, but to use it properly you must clearly understand what you are doing, have proper knowledge, and it is essential to make a backup first.

There are YouTube videos explaining how to use it.

What I personally do not like is that it takes a long time during the shrinking process. In many cases, using the Windows built-in tool is faster.

---

## 📋 “Copy” Button

The field:

> “Size of space to shrink (MB)”

includes a **Copy** button.

This button:

* Automatically copies the value to the clipboard.
* Allows you to paste it directly into the real Windows window.

---

## 📱 Mobile Use

The design is responsive:

* On computers → two-column layout.
* On mobile devices → single-column layout.

The simulator appears first and the result appears below.

---

## 🛠️ How It Is Built

* HTML
* CSS (Windows 10-style visual theme)
* JavaScript (divider logic and calculations)
* Clipboard API to copy values

No backend or installation required.

---

## 📘 Important Concept

Many people believe that if they have, for example:

Free space: 250 GB

They will be able to shrink 250 GB completely.

Windows does not only look at how much free space exists.
It also checks where files are physically located on the disk.

If there are important files near the end of the disk, Windows will not be able to shrink beyond them.

That is what this simulator helps you understand visually.

---

## ⚠️ Explanation of the Official Microsoft Warning

The [Microsoft documentation](https://learn.microsoft.com/es-es/windows-server/storage/disk-management/shrink-a-basic-volume) includes the following warning:

> "If the partition is a raw partition that contains data, such as a database file, shrinking the partition might destroy the data."

### What does this mean?

This warning refers specifically to **partitions that Windows cannot recognize or interpret**, meaning it does not refer to the typical “C:” drive used by normal users, but to another partition that is not formatted as NTFS.

Typical server example:

* The administrator creates an additional disk.
* That disk is NOT formatted with NTFS.
* It is provided directly to a database engine.
* SQL Server writes data directly at block level.

In that case:

* Windows does not see files.
* There is no MFT (Master File Table).
* There is no NTFS structure.
* The volume appears as RAW.

But SQL Server knows which blocks contain data.

A raw partition is one that:

* Does not use a filesystem recognized by Windows (NTFS, FAT32, exFAT).
* Is used directly by specialized software at block level.
* Uses a format not recognized by Windows (such as Linux partitions like ext4, and others).

### Why could shrinking destroy data?

When shrinking a normal NTFS partition, Windows:

1. Reads the filesystem metadata (MFT).
2. Knows where files are located.
3. Moves movable files if necessary.
4. Shrinks the partition safely.

However, in a RAW partition:

* There is no filesystem structure.
* Windows cannot identify which blocks contain critical data.
* The shrink operation may cut through active data blocks.
* This can cause irreversible data loss.

### Does this apply to typical home users?

If you are shrinking:

* The Windows system partition (C:)
* A standard NTFS data partition

This warning does not apply.

It mainly refers to:

* Database servers using raw storage
* Industrial systems
* Embedded systems
* Specialized storage configurations

### Recommended Practice

Even when shrinking standard NTFS partitions, it is strongly recommended to:

* Make a backup of important files (e.g., thesis, assignments, work documents, audio/video projects, etc.).
* Ensure system stability.
* Avoid power interruptions during the operation.

Partition changes modify the structure of the storage device, and unexpected failures (such as a power outage) can cause damage.

If the power goes out while Windows is shrinking the volume:

* The system may fail to boot.
* The partition may become damaged.
* Files may be lost.

For that reason, it is recommended to:

* Use a laptop with a charged battery.
* Or use a UPS if using a desktop computer.

---

## 📄 License

Educational project for free use, licensed under GPL 3.

---
