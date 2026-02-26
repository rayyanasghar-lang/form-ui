"use server"

import { AshraeRecord, fetchAshraeData, createAshraeRecord, updateAshraeRecord, deleteAshraeRecord } from "@/app/actions/ashrae-service"

export async function fetchAshraeAction(params: any) {
    return await fetchAshraeData(params)
}

export async function createAshraeAction(data: AshraeRecord) {
    return await createAshraeRecord(data)
}

export async function updateAshraeAction(uuid: string, data: Partial<AshraeRecord>) {
    return await updateAshraeRecord(uuid, data)
}

export async function deleteAshraeAction(uuid: string) {
    return await deleteAshraeRecord(uuid)
}
