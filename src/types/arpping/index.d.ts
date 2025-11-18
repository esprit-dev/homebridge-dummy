declare module 'arpping' {

  type ARPPingHost = { ip: string, mac: string }
  type ARPPingResult = { hosts: ARPPingHost[]; };

  class ARPPing {
    constructor( opts?: { useCache: boolean } );
    searchByMacAddress(macArray: string[]): Promise<ARPPingResult>;
  }

  export default ARPPing;
}
