import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ABIChanged,
  AddrChanged,
  AddressChanged,
  AuthorisationChanged,
  ContenthashChanged,
  DNSRecordChanged,
  DNSRecordDeleted,
  DNSZoneCleared,
  InterfaceChanged,
  NameChanged,
  PubkeyChanged,
  TextChanged
} from "../generated/L2PublicResolver/L2PublicResolver"

export function createABIChangedEvent(
  node: Bytes,
  contentType: BigInt
): ABIChanged {
  let abiChangedEvent = changetype<ABIChanged>(newMockEvent())

  abiChangedEvent.parameters = new Array()

  abiChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  abiChangedEvent.parameters.push(
    new ethereum.EventParam(
      "contentType",
      ethereum.Value.fromUnsignedBigInt(contentType)
    )
  )

  return abiChangedEvent
}

export function createAddrChangedEvent(node: Bytes, a: Address): AddrChanged {
  let addrChangedEvent = changetype<AddrChanged>(newMockEvent())

  addrChangedEvent.parameters = new Array()

  addrChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  addrChangedEvent.parameters.push(
    new ethereum.EventParam("a", ethereum.Value.fromAddress(a))
  )

  return addrChangedEvent
}

export function createAddressChangedEvent(
  node: Bytes,
  coinType: BigInt,
  newAddress: Bytes
): AddressChanged {
  let addressChangedEvent = changetype<AddressChanged>(newMockEvent())

  addressChangedEvent.parameters = new Array()

  addressChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  addressChangedEvent.parameters.push(
    new ethereum.EventParam(
      "coinType",
      ethereum.Value.fromUnsignedBigInt(coinType)
    )
  )
  addressChangedEvent.parameters.push(
    new ethereum.EventParam("newAddress", ethereum.Value.fromBytes(newAddress))
  )

  return addressChangedEvent
}

export function createAuthorisationChangedEvent(
  node: Bytes,
  owner: Address,
  target: Address,
  isAuthorised: boolean
): AuthorisationChanged {
  let authorisationChangedEvent = changetype<AuthorisationChanged>(
    newMockEvent()
  )

  authorisationChangedEvent.parameters = new Array()

  authorisationChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  authorisationChangedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  authorisationChangedEvent.parameters.push(
    new ethereum.EventParam("target", ethereum.Value.fromAddress(target))
  )
  authorisationChangedEvent.parameters.push(
    new ethereum.EventParam(
      "isAuthorised",
      ethereum.Value.fromBoolean(isAuthorised)
    )
  )

  return authorisationChangedEvent
}

export function createContenthashChangedEvent(
  node: Bytes,
  hash: Bytes
): ContenthashChanged {
  let contenthashChangedEvent = changetype<ContenthashChanged>(newMockEvent())

  contenthashChangedEvent.parameters = new Array()

  contenthashChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  contenthashChangedEvent.parameters.push(
    new ethereum.EventParam("hash", ethereum.Value.fromBytes(hash))
  )

  return contenthashChangedEvent
}

export function createDNSRecordChangedEvent(
  node: Bytes,
  name: Bytes,
  resource: i32,
  record: Bytes
): DNSRecordChanged {
  let dnsRecordChangedEvent = changetype<DNSRecordChanged>(newMockEvent())

  dnsRecordChangedEvent.parameters = new Array()

  dnsRecordChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  dnsRecordChangedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromBytes(name))
  )
  dnsRecordChangedEvent.parameters.push(
    new ethereum.EventParam(
      "resource",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(resource))
    )
  )
  dnsRecordChangedEvent.parameters.push(
    new ethereum.EventParam("record", ethereum.Value.fromBytes(record))
  )

  return dnsRecordChangedEvent
}

export function createDNSRecordDeletedEvent(
  node: Bytes,
  name: Bytes,
  resource: i32
): DNSRecordDeleted {
  let dnsRecordDeletedEvent = changetype<DNSRecordDeleted>(newMockEvent())

  dnsRecordDeletedEvent.parameters = new Array()

  dnsRecordDeletedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  dnsRecordDeletedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromBytes(name))
  )
  dnsRecordDeletedEvent.parameters.push(
    new ethereum.EventParam(
      "resource",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(resource))
    )
  )

  return dnsRecordDeletedEvent
}

export function createDNSZoneClearedEvent(node: Bytes): DNSZoneCleared {
  let dnsZoneClearedEvent = changetype<DNSZoneCleared>(newMockEvent())

  dnsZoneClearedEvent.parameters = new Array()

  dnsZoneClearedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )

  return dnsZoneClearedEvent
}

export function createInterfaceChangedEvent(
  node: Bytes,
  interfaceID: Bytes,
  implementer: Address
): InterfaceChanged {
  let interfaceChangedEvent = changetype<InterfaceChanged>(newMockEvent())

  interfaceChangedEvent.parameters = new Array()

  interfaceChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  interfaceChangedEvent.parameters.push(
    new ethereum.EventParam(
      "interfaceID",
      ethereum.Value.fromFixedBytes(interfaceID)
    )
  )
  interfaceChangedEvent.parameters.push(
    new ethereum.EventParam(
      "implementer",
      ethereum.Value.fromAddress(implementer)
    )
  )

  return interfaceChangedEvent
}

export function createNameChangedEvent(node: Bytes, name: string): NameChanged {
  let nameChangedEvent = changetype<NameChanged>(newMockEvent())

  nameChangedEvent.parameters = new Array()

  nameChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  nameChangedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return nameChangedEvent
}

export function createPubkeyChangedEvent(
  node: Bytes,
  x: Bytes,
  y: Bytes
): PubkeyChanged {
  let pubkeyChangedEvent = changetype<PubkeyChanged>(newMockEvent())

  pubkeyChangedEvent.parameters = new Array()

  pubkeyChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  pubkeyChangedEvent.parameters.push(
    new ethereum.EventParam("x", ethereum.Value.fromFixedBytes(x))
  )
  pubkeyChangedEvent.parameters.push(
    new ethereum.EventParam("y", ethereum.Value.fromFixedBytes(y))
  )

  return pubkeyChangedEvent
}

export function createTextChangedEvent(
  node: Bytes,
  indexedKey: string,
  key: string
): TextChanged {
  let textChangedEvent = changetype<TextChanged>(newMockEvent())

  textChangedEvent.parameters = new Array()

  textChangedEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  textChangedEvent.parameters.push(
    new ethereum.EventParam("indexedKey", ethereum.Value.fromString(indexedKey))
  )
  textChangedEvent.parameters.push(
    new ethereum.EventParam("key", ethereum.Value.fromString(key))
  )

  return textChangedEvent
}
