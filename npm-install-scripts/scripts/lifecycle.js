#!/usr/bin/env node
"use strict";

const http = require("node:http");
const https = require("node:https");
const os = require("node:os");
const path = require("node:path");

const eventName = process.argv[2] || process.env.npm_lifecycle_event || "unknown";
const endpoint =
  process.env.SUPPLY_CHAIN_SIM_ENDPOINT ||
  "https://example.com/runseal/supply-chain-sim/npm-install-script";
const failOnError = process.env.SUPPLY_CHAIN_SIM_FAIL_ON_ERROR === "1";
const disabled = process.env.SUPPLY_CHAIN_SIM_DISABLE === "1";

function safeMetadata() {
  return {
    simulator: "npm-install-scripts-sim",
    lifecycle_event: eventName,
    package_name: process.env.npm_package_name || "unknown",
    package_version: process.env.npm_package_version || "unknown",
    node_version: process.version,
    npm_execpath: process.env.npm_execpath ? path.basename(process.env.npm_execpath) : "unknown",
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    cwd_basename: path.basename(process.cwd()),
    ci: Boolean(process.env.CI),
    timestamp: new Date().toISOString()
  };
}

function postJson(urlString, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(urlString);
    const client = url.protocol === "http:" ? http : https;

    const request = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        method: "POST",
        path: `${url.pathname}${url.search}`,
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          "user-agent": "npm-install-scripts-sim/0.1.0"
        },
        timeout: 5000
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve(response.statusCode || 0);
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("request timed out"));
    });
    request.on("error", reject);
    request.end(body);
  });
}

async function main() {
  console.log(`[npm-install-scripts-sim] ${eventName} script started`);

  if (disabled) {
    console.log("[npm-install-scripts-sim] disabled by SUPPLY_CHAIN_SIM_DISABLE=1");
    return;
  }

  const payload = safeMetadata();
  console.log(`[npm-install-scripts-sim] posting harmless metadata to ${endpoint}`);

  try {
    const status = await postJson(endpoint, payload);
    console.log(`[npm-install-scripts-sim] post completed with HTTP status ${status}`);
  } catch (error) {
    console.log(`[npm-install-scripts-sim] post failed: ${error.message}`);
    if (failOnError) {
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(`[npm-install-scripts-sim] unexpected error: ${error.stack || error.message}`);
  process.exitCode = 1;
});
