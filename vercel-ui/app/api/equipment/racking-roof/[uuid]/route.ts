import { NextRequest } from "next/server"
import { proxyDetail, proxyUpdate, proxyDelete } from "../../utility"

const TYPE = "racking-roof"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params
  return proxyDetail(request, TYPE, uuid)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params
  return proxyUpdate(request, TYPE, uuid)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params
  return proxyDelete(request, TYPE, uuid)
}
