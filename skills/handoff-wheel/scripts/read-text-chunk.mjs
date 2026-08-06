#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const options = parseArgs(process.argv.slice(2));
  const raw = readFileSync(options.path);
  if (options.start > raw.length) {
    throw new Error(`start ${options.start} exceeds file size ${raw.length}`);
  }
  if (options.start < raw.length && isUtf8ContinuationByte(raw[options.start])) {
    throw new Error(`start ${options.start} is not a UTF-8 character boundary`);
  }

  let end = Math.min(options.start + options.maxBytes, raw.length);
  while (end > options.start && end < raw.length && isUtf8ContinuationByte(raw[end])) {
    end -= 1;
  }
  if (end === options.start && end < raw.length) {
    end = Math.min(options.start + options.maxBytes, raw.length);
    while (end < raw.length && isUtf8ContinuationByte(raw[end])) {
      end += 1;
    }
  }

  const content = raw.toString("utf8", options.start, end);
  process.stdout.write(`--- bytes ${options.start}-${end} of ${raw.length}; next=${end} ---\n`);
  process.stdout.write(content);
  if (!content.endsWith("\n")) {
    process.stdout.write("\n");
  }
  process.stdout.write("--- end chunk ---\n");
} catch (error) {
  process.stderr.write(`handoff-wheel: ${error.message}\n`);
  process.exitCode = 1;
}

function parseArgs(args) {
  let path = "";
  let start = 0;
  let maxBytes = 12_000;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--start") {
      start = parseNonNegativeInteger(requireOptionValue(args, ++index, arg), arg);
    } else if (arg === "--max-bytes") {
      maxBytes = parsePositiveInteger(requireOptionValue(args, ++index, arg), arg);
    } else if (arg.startsWith("-")) {
      throw new Error(`unknown option: ${arg}`);
    } else if (path) {
      throw new Error(`unexpected argument: ${arg}`);
    } else {
      path = resolve(arg);
    }
  }
  if (!path) {
    throw new Error("transcript path is required");
  }
  return { path, start, maxBytes };
}

function requireOptionValue(args, index, option) {
  const value = args[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function parseNonNegativeInteger(raw, option) {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${option} requires a non-negative integer`);
  }
  return value;
}

function parsePositiveInteger(raw, option) {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${option} requires a positive integer`);
  }
  return value;
}

function isUtf8ContinuationByte(value) {
  return (value & 0xc0) === 0x80;
}
