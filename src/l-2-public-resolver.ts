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
import { Address, ByteArray, Bytes, log, crypto, ens } from '@graphprotocol/graph-ts'

export function handleNameSet(event: NameSetEvent): void { 
  let domainId = createDomainID(event.params.node, event.address);
  let domain = Domain.load(domainId);
  if(!domain){
    domain = new Domain(domainId)
  }
  let decoded = decodeName(event.params.name)
  log.warning('*******decode1 {}', [event.params.name.toHexString()])
  if(decoded){
    
    let labelName = decoded[0]
    let labelHex = encodeHex(labelName)    
    let labelhash = crypto.keccak256(byteArrayFromHex(labelHex)).toHex()
    log.warning('*******decode2  {} {} {}', [labelName, labelHex, labelhash])
    let name = decoded ? decoded[1] : ''
    log.warning('*******decode3  {} ', [name])
    let parentName = decoded ? decoded[2] : ''
    log.warning('*******decode4  {} ', [parentName])
    let parentEncoded = decoded ? decoded[3] : ''
    log.warning('*******decode5  {} ', [parentEncoded])
    let foo = namehash(event.params.name)
    log.warning('*******decode6  {} ', [foo.toHexString()])
    let parentNode = namehash(Bytes.fromHexString(parentEncoded))
    log.warning('*******decode7  {} ', [parentNode.toHexString()])
    domain.name = name
    domain.labelName = labelName
    domain.labelhash = Bytes.fromHexString(labelhash)
    let parentDomainId = createDomainID(parentNode, event.address);
    let parentDomain = createDomain(
      parentNode,
      event.address
    )
    parentDomain.save()
    domain.parent = parentDomainId
    if(parentDomain.name == null){
      let decodedParent = decodeName(Bytes.fromHexString(parentEncoded))
      let parentLabelName = decoded[0]
      let parentLabelHex = encodeHex(parentLabelName)
      let parentLabelhash = crypto.keccak256(byteArrayFromHex(parentLabelHex)).toHex()
      log.warning('*******decode8  {} {} {}', [parentLabelName, parentLabelHex, parentLabelhash])
      let parentName = decodedParent ? decodedParent[1] : ''
      parentDomain.name = parentName
      parentDomain.labelName = parentLabelName
      log.warning('*******decode8.1  {}', [parentName])
      parentDomain.labelhash = Bytes.fromHexString(parentLabelhash)
    }else{
      let parentDomainName = parentDomain.name
      if(parentDomainName){
        log.warning('*******decode9  {} ', [parentDomainName.toString()])
      }else{
        log.warning('*******decode9.1  should not happen ', [])
      }
    }
    log.warning('*******decode10  {} ', [parentDomainId])
    parentDomain.save()
  }
  domain.save()
}

export function handleAddrChanged(event: AddrChangedEvent): void {
  log.warning('*******handleAddrChanged1', [])
  let entity = new AddrChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  log.warning('*******handleAddrChanged2', [])
  let resolver = createResolver(
    event.params.node,
    event.address,
    event.params.ownedNode,
    event.transaction.from
  )
  resolver.save();
  log.warning('*******handleAddrChanged4', [])
  let domain = createDomain(
    event.params.node,
    event.address,
    resolver.id
  )
  domain.resolvedAddress = event.params.a;  
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
  let resolver = createResolver(
    event.params.node,
    event.address,
    event.params.ownedNode,
    event.transaction.from
  )
  resolver.save();
  log.warning('*******handleAddressChanged4', [])
  let domain = createDomain(
    event.params.node,
    event.address,
    resolver.id
  )
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

  let resolver = createResolver(
    event.params.node,
    event.address,
    event.params.ownedNode,
    event.transaction.from
  )
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
  let domain = createDomain(
    event.params.node,
    event.address,
    resolver.id
  )
  domain.save()
}

function createResolver(node: Bytes, address: Address, ownedNode: Bytes, owner: Address): Resolver{
  let resolver = new Resolver(
    createResolverID(node, address)
  );
  resolver.address = address;
  resolver.ownedNode = ownedNode.toHexString();
  resolver.owner = owner
  return resolver
}

function createDomain(node: Bytes, address: Address, resolverId: string = ''): Domain{
  let domain = new Domain(createDomainID(node, address));  
  domain.namehash = node;
  if(resolverId != ''){
    domain.resolver = resolverId;
  }
  return domain
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

function makeSubnode(node: Bytes, label: Bytes): string {
  return crypto.keccak256(concat(node, label)).toHexString()
}

export function namehash(buf: Bytes): Bytes {
  log.warning('*******namehash:buf {} buf hex{}', [buf.toString(), buf.toHexString()])
  let offset = 0;

  let hashlength = 64;
  let list = new ByteArray(0);
  let list2 = new ByteArray(0);
  let list3 = new ByteArray(0);
  let parent = new ByteArray(0);
  let dot = Bytes.fromHexString("2e");
  let len = buf[offset++];
  let hex = buf.toHexString();
  let firstLabel = "";
  let nodehash = '0000000000000000000000000000000000000000000000000000000000000000'
  let n = 0
  while (len) {
    n = n + 1
    log.warning('*******namehash0 offset {} ', [offset.toString()])
    log.warning('*******namehash1 len    {} ', [len.toString()])
    log.warning('*******namehash2 list   {} ', [list.toString()])
    log.warning('*******namehash3 dot    {} ', [dot.toString()])

    let label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
    log.warning('*******namehash3.1  {}', [label.toString()])
    
    // if(parentNode == ""){
    //   parentNode = hex.slice((offset + 1 + len) * 2);
    // }
    // log.warning('*******while3.2  {}', [parentNode.toString()])
    let labelBytes = Bytes.fromHexString(label);
    log.warning('*******namehash3.2  {}', [labelBytes.toString()])
    // log.warning('*******while4  {} ', [labelBytes.toString()])

    // if (!checkValidLabel(labelBytes.toString())) {
    //   return null;
    // }

    if (offset > 1) {
    //   log.warning('*******while4.0-  list {} parent {}', [list.toString(), parent.toString()])
    //   if(parent.toString() != ''){
    //     log.warning('*******while4.0--  list {} parent {}', [list.toString(), parent.toString()])
    //     parent = concat(parent, dot);
    //   }
      list = concat(list, dot);
      // list2 = concat(dot, list);
    //   log.warning('*******while4.0+  list {} parent {}', [list.toString(), parent.toString()])
    } else {
    //   firstLabel = labelBytes.toString();
    //   log.warning('*******while4.1  {} ', [firstLabel])
    }
    list = concat(list, labelBytes);
    list2 = concat(labelBytes, list2);
    let labelhash = crypto.keccak256(labelBytes);
    list3 = concat(labelhash, list3);
    log.warning('*******namehash4.1  {}', [list2.toString()])
    log.warning('*******namehash4.2  {}, {}', [labelhash.toHexString(), labelhash.toHexString().length.toString()])
    log.warning('*******namehash4.3  {}', [list3.toHexString()])
    // if(labelBytes.toString() != firstLabel.toString()){
    //   parent = concat(parent, labelBytes);
    // }
    offset += len;
    len = buf[offset++];
    // log.warning('*******while5 len {} list {} parent {}', [len.toString(), list.toString(), parent.toString()])
  }
  let j = 0
  let bar = list3.toHexString().slice(0,66)
  log.warning('*******namehash5.1  n {} bar {}', [n.toString(), bar])
  let offset2 = 2;
  while(j < n){
    j = j + 1

    log.warning('*******namehash5.2 s {} e {}', [offset2.toString(), (offset2 + hashlength).toString()])
    let l = list3.toHexString().slice(offset2, offset2 + hashlength);
    log.warning('*******namehash5.3 n {} l {}', [nodehash.toString(), l])
    nodehash = makeSubnode(Bytes.fromHexString(nodehash), Bytes.fromHexString(l));
    log.warning('*******namehash5.4 new nodehash {}', [nodehash])
    offset2 = offset2 + hashlength;
    
  }
  // return changetype<Bytes>(nodehash);
  return Bytes.fromHexString(nodehash);
}


function decodeName(buf: Bytes): Array<string> | null {
  let offset = 0;
  let list = new ByteArray(0);
  let parent = new ByteArray(0);
  let dot = Bytes.fromHexString("2e");
  let len = buf[offset++];
  let hex = buf.toHexString();
  let firstLabel = "";
  let parentNode = "";
  if (len === 0) {
    return [firstLabel, "."];
  }
  let i = 0;
  while (len) {
    i = i +1;
    log.warning('*******while0 i{} o {} b {} bh {}', [i.toString(), offset.toString(), buf.toString(), buf.toHexString()])
    log.warning('*******while1  {} ', [len.toString()])
    log.warning('*******while2  {} ', [list.toString()])
    log.warning('*******while3  {} ', [dot.toString()])

    let label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
    log.warning('*******while3.1  {}', [label.toString()])
    if(parentNode == ""){
      parentNode = hex.slice((offset + 1 + len) * 2);
    }
    log.warning('*******while3.2  {}', [parentNode.toString()])
    let labelBytes = Bytes.fromHexString(label);
    log.warning('*******while4  {} ', [labelBytes.toString()])

    if (!checkValidLabel(labelBytes.toString())) {
      return null;
    }

    if (offset > 1) {
      log.warning('*******while4.0-  list {} parent {}', [list.toString(), parent.toString()])
      if(parent.toString() != ''){
        log.warning('*******while4.0--  list {} parent {}', [list.toString(), parent.toString()])
        parent = concat(parent, dot);
      }
      list = concat(list, dot);
      log.warning('*******while4.0+  list {} parent {}', [list.toString(), parent.toString()])
    } else {
      firstLabel = labelBytes.toString();
      log.warning('*******while4.1  {} ', [firstLabel])
    }
    list = concat(list, labelBytes);
    if(labelBytes.toString() != firstLabel.toString()){
      parent = concat(parent, labelBytes);
    }
    offset += len;
    len = buf[offset++];
    log.warning('*******while5 len {} list {} parent {}', [len.toString(), list.toString(), parent.toString()])
  }
  return [firstLabel, list.toString(), parent.toString(), parentNode.toString()];
}

export function byteArrayFromHex(s: string): ByteArray {
  if(s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters")
  }
  let out = new Uint8Array(s.length / 2)
  for(var i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32
  }
  return changetype<ByteArray>(out)
}

export function encodeHex(data: string): string {
  const array = Uint8Array.wrap(String.UTF8.encode(data))
  let hex = ''
  for (let i = 0; i < array.length; i++) {
      hex += array[i].toString(16)
  }
  return hex
}
