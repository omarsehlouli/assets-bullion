#!/bin/bash
# Time-labelled contact sheet of a video passage, for reviewing motion and timing.
#   scripts/review-grid.sh <video> <start s> <end s> <every s> <cols> <rows> <cell width px> <out.jpg>
# Example: scripts/review-grid.sh out/marketing/story/whats-inside.mp4 31 37.5 0.25 9 3 240 who.jpg
# Labels come from the stream clock, so sparse sampling can drift a frame or two;
# frame-step a moment exactly with: ffmpeg -ss <t> -i <video> -frames:v 1 still.jpg
set -e
src=$1; a=$2; b=$3; e=$4; c=$5; r=$6; w=$7; out=$8
ffmpeg -v error -i "$src" -vf "trim=start=$a:end=$b,fps=1/$e,scale=$w:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=${c}x${r}" -frames:v 1 -y "$out"
