import {
  AddrChanged as AddrChangedEvent,
  AddressChanged as AddressChangedEvent,
  TextChanged as TextChangedEvent,
  // NameSet as NameSetEvent
} from "../generated/L2PublicResolver/L2PublicResolver"

import {
  AddrChanged,
  AddressChanged,
  TextChanged,
  Resolver,
  Domain,
  Offchain
} from "../generated/schema"
import { Address, BigInt, Bytes, crypto, log } from '@graphprotocol/graph-ts'
import {
  decodeName,
  namehash,
  byteArrayFromHex,
  encodeHex
} from './utils'

export function handleName(node:Bytes, context:Address, dnsName:Bytes): void { 
  let domainId = createDomainID(node, context);
  let domain = Domain.load(domainId);
  if(!domain){
    domain = new Domain(domainId)
  }
  log.warning("*** handleName1 {}", [domainId])
  let decoded = decodeName(dnsName)
  if(decoded){    
    let labelName = decoded[0]
    let labelHex = encodeHex(labelName)    
    let labelhash = crypto.keccak256(byteArrayFromHex(labelHex)).toHex()
    let name = decoded ? decoded[1] : ''
    let parentEncoded = decoded ? decoded[3] : ''
    let parentNode = namehash(Bytes.fromHexString(parentEncoded))
    log.warning("*** handleName2 {}", [name])
    domain.name = name
    domain.labelName = labelName
    domain.labelhash = Bytes.fromHexString(labelhash)
    let parentDomainId = createDomainID(parentNode, context);
    let parentDomain = createDomain(
      parentNode,
      context
    )
    parentDomain.save()
    domain.parent = parentDomainId
    if(parentDomain.name == null){
      let decodedParent = decodeName(Bytes.fromHexString(parentEncoded))
      let parentLabelName = decodedParent ? decodedParent[0] : ''
      let parentLabelHex = encodeHex(parentLabelName)
      let parentLabelhash = crypto.keccak256(byteArrayFromHex(parentLabelHex)).toHex()
      let parentName = decodedParent ? decodedParent[1] : ''
      let parentParentName = decodedParent ? decodedParent[2] : ''
      parentDomain.name = parentName
      parentDomain.labelName = parentLabelName
      parentDomain.labelhash = Bytes.fromHexString(parentLabelhash)
    }
    parentDomain.save()
  }
  domain.save()
}

export function handleAddrChanged(event: AddrChangedEvent): void {
  log.warning("*** handleAddrChanged1", [])
  let entity = new AddrChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  log.warning("*** handleAddrChanged2", [])
  let resolver = createResolver(
    event.params.node,
    event.address,
    event.transaction.from
  )
  log.warning("*** handleAddrChanged3", [])
  resolver.addr = event.params.a;
  resolver.save();
  log.warning("*** handleAddrChanged4", [])
  let domain = createDomain(
    event.params.node,
    event.address,
    resolver.id
  )
  log.warning("*** handleAddrChanged5", [])
  domain.resolvedAddress = event.params.a;
  domain.save()
  handleName(event.params.node, event.address, event.params.name)
  log.warning("*** handleAddrChanged5.1", [])
  entity.context = event.params.context
  entity.name = event.params.name
  entity.node = event.params.node
  entity.a = event.params.a

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  log.warning("*** handleAddrChanged6", [])
  entity.save()
  log.warning("*** handleAddrChanged7", [])
}

export function handleAddressChanged(event: AddressChangedEvent): void {
  log.warning("*** handleAddressChanged", [])
  let entity = new AddressChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.context = event.params.context
  entity.name = event.params.name
  entity.coinType = event.params.coinType
  entity.newAddress = event.params.newAddress
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
  let resolver = createResolver(
    event.params.node,
    event.address,
    event.transaction.from
  )
  resolver.save();
  let domain = createDomain(
    event.params.node,
    event.address,
    resolver.id
  )
  domain.save()
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
  log.warning("*** handleTextChanged", [])
  let node = event.params.node.toHexString();
  let entity = new TextChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.node = event.params.node
  entity.context = event.params.context
  entity.name = event.params.name
  entity.key = event.params.key

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let resolver = createResolver(
    event.params.node,
    event.address,
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

function createResolver(node: Bytes, address: Address, owner: Address): Resolver{
  let resolver = new Resolver(
    createResolverID(node, address)
  );
  resolver.address = address;
  resolver.owner = owner
  return resolver
}

function createDomain(node: Bytes, address: Address, resolverId: string = ''): Domain{
  let domain = new Domain(createDomainID(node, address));  
  domain.namehash = node;
  if(resolverId != ''){
    domain.resolver = resolverId;
  }
  if(domain.offchain == null){
    // Dervied via convertEVMChainIdToCoinType at https://github.com/ensdomains/address-encoder
    let offchainId = 2147488648
    let offchain = new Offchain(offchainId.toString());
    if(offchain.name == null){
      offchain.name = "Mantle"
      offchain.chainId = BigInt.fromI32(5000)
      offchain.isEVM = true
    }
    domain.offchain = offchain.id;
    offchain.save()
  }
  domain.save()

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