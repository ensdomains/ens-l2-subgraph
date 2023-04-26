import {
  ABIChanged as ABIChangedEvent,
  AddrChanged as AddrChangedEvent,
  AddressChanged as AddressChangedEvent,
  AuthorisationChanged as AuthorisationChangedEvent,
  ContenthashChanged as ContenthashChangedEvent,
  DNSRecordChanged as DNSRecordChangedEvent,
  DNSRecordDeleted as DNSRecordDeletedEvent,
  DNSZoneCleared as DNSZoneClearedEvent,
  InterfaceChanged as InterfaceChangedEvent,
  NameChanged as NameChangedEvent,
  PubkeyChanged as PubkeyChangedEvent,
  TextChanged as TextChangedEvent
} from "../generated/L2PublicResolver/L2PublicResolver"
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
} from "../generated/schema"

export function handleABIChanged(event: ABIChangedEvent): void {
  let entity = new ABIChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.contentType = event.params.contentType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAddrChanged(event: AddrChangedEvent): void {
  let entity = new AddrChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.a = event.params.a

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAddressChanged(event: AddressChangedEvent): void {
  let entity = new AddressChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.coinType = event.params.coinType
  entity.newAddress = event.params.newAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAuthorisationChanged(
  event: AuthorisationChangedEvent
): void {
  let entity = new AuthorisationChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.owner = event.params.owner
  entity.target = event.params.target
  entity.isAuthorised = event.params.isAuthorised

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleContenthashChanged(event: ContenthashChangedEvent): void {
  let entity = new ContenthashChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.hash = event.params.hash

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDNSRecordChanged(event: DNSRecordChangedEvent): void {
  let entity = new DNSRecordChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.name = event.params.name
  entity.resource = event.params.resource
  entity.record = event.params.record

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDNSRecordDeleted(event: DNSRecordDeletedEvent): void {
  let entity = new DNSRecordDeleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.name = event.params.name
  entity.resource = event.params.resource

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDNSZoneCleared(event: DNSZoneClearedEvent): void {
  let entity = new DNSZoneCleared(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInterfaceChanged(event: InterfaceChangedEvent): void {
  let entity = new InterfaceChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.interfaceID = event.params.interfaceID
  entity.implementer = event.params.implementer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNameChanged(event: NameChangedEvent): void {
  let entity = new NameChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePubkeyChanged(event: PubkeyChangedEvent): void {
  let entity = new PubkeyChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.x = event.params.x
  entity.y = event.params.y

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTextChanged(event: TextChangedEvent): void {
  let entity = new TextChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.indexedKey = event.params.indexedKey
  entity.key = event.params.key

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
