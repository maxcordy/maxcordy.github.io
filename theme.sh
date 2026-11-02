#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
themes_dir="$script_dir/themes"
available_themes=("vivid-cloud" "aurora-mist")

usage() {
  printf 'Usage: bash theme.sh THEME_NAME\n\n'
  printf 'Available themes:\n'
  printf '  vivid-cloud    Bright, high-contrast cloud design\n'
  printf '  aurora-mist    Periwinkle, lavender and glass-cloud design\n'
  printf '\nUse "bash theme.sh list" to show the active theme.\n'
}

active_theme() {
  local reference
  reference="$(sed -nE 's/.*themes\/theme-([a-z-]+)\.css.*/\1/p' "$script_dir/index.html" | head -n 1)"
  printf '%s' "${reference:-unknown}"
}

if [[ ${1:-} == "list" ]]; then
  printf 'Available themes:\n'
  for theme in "${available_themes[@]}"; do
    if [[ $theme == "$(active_theme)" ]]; then
      printf '  %s (active)\n' "$theme"
    else
      printf '  %s\n' "$theme"
    fi
  done
  exit 0
fi

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

theme="$1"
theme_file="$themes_dir/theme-$theme.css"

if [[ ! -f $theme_file ]]; then
  printf 'Unknown theme: %s\n\n' "$theme" >&2
  usage >&2
  exit 1
fi

while IFS= read -r -d '' html_file; do
  temporary_file="${html_file}.theme-tmp"
  sed -E "s#themes/theme-[a-z-]+\\.css#themes/theme-${theme}.css#g" "$html_file" > "$temporary_file"
  mv "$temporary_file" "$html_file"
done < <(find "$script_dir" -name '*.html' -type f -print0)

printf 'Theme switched to: %s\n' "$theme"
