import {
  AddrChanged as AddrChangedEvent,
  AddressChanged as AddressChangedEvent,
  TextChanged as TextChangedEvent,
  ContenthashChanged as ContenthashChangedEvent,
  Approved as ApprovedEvent
} from "../generated/L2PublicResolver/L2PublicResolver"

import {
  AddrChanged,
  AddressChanged,
  ContenthashChanged,
  TextChanged,
  Approved,
  Resolver,
  Domain,
  Account
} from "../generated/schema"
import { Address, BigInt, Bytes, crypto, log } from '@graphprotocol/graph-ts'
import {
  decodeName,
  namehash,
  byteArrayFromHex,
  encodeHex
} from './utils'

export function handleApproved(event: ApprovedEvent): void {
  let entity = new Approved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let context = event.params.context
  let name = event.params.name
  let node = namehash(event.params.name)
  let delegate = event.params.delegate
  let approved = event.params.approved

  entity.context = context
  entity.name = name
  entity.node = node
  entity.delegate = delegate
  entity.approved = approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
  handleName(node, context, name)
  let domainId = createDomainID(node, context);
  let domain = Domain.load(domainId);
  if(domain){
    if(domain.delegates == null) {
      if(approved === true){
        domain.delegates = [delegate];
        domain.save();  
      }
    } else {
      let delegates = domain.delegates!
      if(approved === true){
        if(!delegates.includes(delegate)){
          delegates.push(delegate)
          domain.delegates = delegates
          domain.save()
        }  
      }else{
        const index = delegates.indexOf(delegate)
        if(index >= 0){
          // Remove delegation
          delegates.splice(index, 1)
          domain.delegates = delegates
          domain.save()
        }  
      }
    }
  }
}

export function handleName(node:Bytes, context:Bytes, dnsName:Bytes): void { 
  let domainId = createDomainID(node, context);
  let domain = Domain.load(domainId);
  if(!domain){
    domain = new Domain(domainId)
  }
  let decoded = decodeName(dnsName)
  if(decoded){    
    let labelName = decoded[0]
    let labelHex = encodeHex(labelName)    
    let labelhash = crypto.keccak256(byteArrayFromHex(labelHex)).toHex()
    let name = decoded ? decoded[1] : ''
    let parentEncoded = decoded ? decoded[3] : ''
    let parentNode = namehash(Bytes.fromHexString(parentEncoded))
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
  let entity = new AddrChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let resolver = getOrCreateResolver(
    event.params.node,
    event.params.context,
    event.address,
  )
  resolver.addr = event.params.a;
  resolver.domain = createDomainID(event.params.node, event.params.context)
  resolver.save();
  let domain = createDomain(
    event.params.node,
    event.params.context,
    resolver.id
  )
  domain.resolvedAddress = event.params.a;
  domain.save()
  handleName(event.params.node, event.params.context, event.params.name)
  entity.context = event.params.context
  entity.name = event.params.name
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
  entity.context = event.params.context
  entity.name = event.params.name
  entity.coinType = event.params.coinType
  entity.newAddress = event.params.newAddress
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
  let resolver = getOrCreateResolver(
    event.params.node,
    event.params.context,
    event.address,
  )
  resolver.save();
  let domain = createDomain(
    event.params.node,
    event.params.context,
    resolver.id
  )
  domain.save()
  handleName(event.params.node, event.params.context, event.params.name)
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
  let entity = new TextChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  handleName(event.params.node, event.params.context, event.params.name)
  entity.node = event.params.node
  entity.context = event.params.context
  entity.name = event.params.name
  entity.key = event.params.key

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let resolver = getOrCreateResolver(
    event.params.node,
    event.params.context,
    event.address,
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
    event.params.context,
    resolver.id
  )
  domain.save()
}

export function handleContentHashChanged(event: ContenthashChangedEvent): void {
  let entity = new ContenthashChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  handleName(event.params.node, event.params.context, event.params.name)
  entity.node = event.params.node
  entity.context = event.params.context
  entity.name = event.params.name
  entity.hash = event.params.hash
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  let resolver = getOrCreateResolver(
    event.params.node,
    event.params.context,
    event.address,
  )
  resolver.contentHash = event.params.hash;
  resolver.save();
  let domain = createDomain(
    event.params.node,
    event.params.context,
    resolver.id
  )
  domain.save()
}

function getOrCreateResolver(node: Bytes, context: Bytes, address: Address): Resolver {
  let id = createResolverID(node, context, address);
  let resolver = Resolver.load(id);
  if (resolver === null) {
    resolver = new Resolver(id);
    resolver.domain = node.toHexString();
    resolver.node = node;
    resolver.context = context;
    resolver.address = address;
  }
  return resolver as Resolver;
}

function createDomain(node: Bytes, context: Bytes, resolverId: string = ''): Domain{
  let domain = new Domain(createDomainID(node, context));  
  domain.namehash = node;
  if(resolverId != ''){
    domain.resolver = resolverId;
    domain.context = context;
  }
  let account = Account.load(context.toHexString());
  if(!account){
    account = new Account(context.toHexString());
  }
  domain.owner = account.id;
  domain.save()
  account.save()
  return domain
}

function createResolverID(node: Bytes, context: Bytes, resolver: Address): string {
  return resolver
    .toHexString()
    .concat("-")
    .concat(
      context
      .toHexString()
      .concat("-")
      .concat(
        node.toHexString()
      )
    );
}

function createDomainID(node: Bytes, context: Bytes): string {
  return context
    .toHexString()
    .concat("-")
    .concat(node.toHexString());
}