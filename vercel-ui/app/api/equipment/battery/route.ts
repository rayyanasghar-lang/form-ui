import { NextRequest } from "next/server"
import { proxyList, proxyCreate } from "../utility"

const TYPE = "battery"

export async function GET(request: NextRequest) {
  return proxyList(request, TYPE)
}

export async function POST(request: NextRequest) {
  return proxyCreate(request, TYPE)
}
