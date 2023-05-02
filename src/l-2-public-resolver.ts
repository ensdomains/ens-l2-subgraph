import {
  AddrChanged as AddrChangedEvent,
  AddressChanged as AddressChangedEvent,
  TextChanged as TextChangedEvent,
  NameSet as NameSetEvent
} from "../generated/L2PublicResolver/L2PublicResolver"

import {
  AddrChanged,
  AddressChanged,
  TextChanged,
  Resolver,
  Domain
} from "../generated/schema"
import { Address, ByteArray, Bytes, log } from '@graphprotocol/graph-ts'

export function handleNameSet(event: NameSetEvent): void { 
  let domainId = createDomainID(event.params.node, event.address);
  let domain = Domain.load(domainId);
  if(!domain){
    domain = new Domain(domainId)
  }
  let decoded = decodeName(event.params.name)
  let name = decoded ? decoded[1] : ''
  let labelName = decoded ? decoded[0] : ''
  domain.name = name
  domain.labelName = labelName
  domain.save()
}

export function handleAddrChanged(event: AddrChangedEvent): void {
  log.warning('*******handleAddrChanged1', [])
  let entity = new AddrChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  log.warning('*******handleAddrChanged2', [])
  let node = event.params.node.toHexString()

  let resolver = new Resolver(
    createResolverID(event.params.node, event.address)
  );
  log.warning('*******handleAddrChanged3', [])
  resolver.address = event.address;
  resolver.ownedNode = event.params.ownedNode.toHexString();
  resolver.addr = event.params.a;
  resolver.owner = event.transaction.from;
  resolver.save();
  log.warning('*******handleAddrChanged4', [])
  let domain = new Domain(createDomainID(event.params.node, event.address));
  domain.resolvedAddress = event.params.a;
  domain.resolver = resolver.id;
  domain.save()
  log.warning('*******handleAddrChanged5', [])
  entity.node = event.params.node
  // entity.ownedNode = event.params.ownedNode.toHexString();
  entity.a = event.params.a

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  log.warning('*******handleAddrChanged6', [])
}

export function handleAddressChanged(event: AddressChangedEvent): void {
  log.warning('*******handleAddressChanged1', [])
  let entity = new AddressChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  log.warning('*******handleAddressChanged2', [])
  entity.node = event.params.node
  entity.ownedNode = event.params.ownedNode
  entity.coinType = event.params.coinType
  entity.newAddress = event.params.newAddress
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
  log.warning('*******handleAddressChanged3', [])
  let node = event.params.node.toHexString()

  let resolver = new Resolver(
    createResolverID(event.params.node, event.address)
  );
  resolver.address = event.address;
  resolver.ownedNode = event.params.ownedNode.toHexString();
  resolver.owner = event.transaction.from;
  resolver.save();
  log.warning('*******handleAddressChanged4', [])
  let domain = new Domain(createDomainID(event.params.node, event.address));
  domain.resolver = resolver.id;
  domain.save()
  log.warning('*******handleAddressChanged5', [])
  let coinType = event.params.coinType
  if(resolver.coinTypes == null) {
    resolver.coinTypes = [coinType];
    resolver.save();
  } else {
    let coinTypes = resolver.coinTypes!
    if(!coinTypes.includes(coinType)){
      coinTypes.push(coinType)
      resolver.coinTypes = coinTypes
      resolver.save()
    }
  }
}

export function handleTextChanged(event: TextChangedEvent): void {
  let node = event.params.node.toHexString();
  let entity = new TextChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.ownedNode = event.params.ownedNode
  // entity.indexedKey = event.params.indexedKey
  entity.key = event.params.key

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let resolver = new Resolver(
    createResolverID(event.params.node, event.address)
  );
  resolver.address = event.address;
  resolver.ownedNode = event.params.ownedNode.toHexString();
  resolver.owner = event.transaction.from;
  let key = event.params.key;
  if(resolver.texts == null) {
    resolver.texts = [key];
    resolver.save();
  } else {
    let texts = resolver.texts!
    if(!texts.includes(key)){
      texts.push(key)
      resolver.texts = texts
      resolver.save()
    }
  }
  resolver.save();

  let  domain = new Domain(node);
  domain.resolver = resolver.id;
  domain.save()
}

function createResolverID(node: Bytes, resolver: Address): string {
  return resolver
    .toHexString()
    .concat("-")
    .concat(node.toHexString());
}

function createDomainID(node: Bytes, resolver: Address): string {
  return resolver
    .toHexString()
    .concat("-")
    .concat(node.toHexString());
}

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  // return out as ByteArray
  return changetype<ByteArray>(out);
}


export function checkValidLabel(name: string): boolean {
  for (let i = 0; i < name.length; i++) {
    let c = name.charCodeAt(i);
    if (c === 0) {
      log.warning("Invalid label '{}' contained null byte. Skipping.", [name]);
      return false;
    } else if (c === 46) {
      log.warning(
        "Invalid label '{}' contained separator char '.'. Skipping.",
        [name]
      );
      return false;
    }
  }

  return true;
}

// function decodeName(buf: Bytes): Array<string> | null {
//   log.warning('*******decodeName1', [])
//   let offset = 0;
//   let list = new ByteArray(0);
//   let dot = Bytes.fromHexString("2e");
//   let len = buf[offset++];
//   let hex = buf.toHexString();
//   let firstLabel = "";
//   log.warning('*******decodeName2', [])
//   if (len === 0) {
//     return [firstLabel, "."];
//   }
//   log.warning('*******decodeName3', [])
//   while (len) {
//     log.warning('*******decodeName3.1', [])
//     let label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
//     log.warning('*******decodeName3.2', [])
//     let labelBytes = Bytes.fromHexString(label);
//     log.warning('*******decodeName3.3', [])
//     if (!checkValidLabel(labelBytes.toString())) {
//       return null;
//     }
//     log.warning('*******decodeName3.4', [])
//     if (offset > 1) {
//       log.warning('*******decodeName3.4.1', [])
//       list = concat(list, dot);
//     } else {
//       log.warning('*******decodeName3.4.2', [])
//       firstLabel = labelBytes.toString();
//     }
//     log.warning('*******decodeName3.5', [])
//     list = concat(list, labelBytes);
//     log.warning('*******decodeName3.6', [])
//     offset += len;
//     log.warning('*******decodeName3.7 len {} offset {}', [len.toString(), offset.toString()])
//     let foo = buf[offset];
//     log.warning('*******decodeName3.9 foo{}', [foo.toString()])
//     len = buf[offset++];
//     log.warning('*******decodeName3.10 len {}', [len.toString()])
//   }
//   return [firstLabel, list.toHexString()];
// }

function decodeName(buf: Bytes): Array<string> | null {
  let offset = 0;
  let list = new ByteArray(0);
  let dot = Bytes.fromHexString("2e");
  let len = buf[offset++];
  let hex = buf.toHexString();
  let firstLabel = "";
  if (len === 0) {
    return [firstLabel, "."];
  }

  while (len) {
    let label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
    let labelBytes = Bytes.fromHexString(label);

    if (!checkValidLabel(labelBytes.toString())) {
      return null;
    }

    if (offset > 1) {
      list = concat(list, dot);
    } else {
      firstLabel = labelBytes.toString();
    }
    list = concat(list, labelBytes);
    offset += len;
    len = buf[offset++];
  }
  return [firstLabel, list.toString()];
}
