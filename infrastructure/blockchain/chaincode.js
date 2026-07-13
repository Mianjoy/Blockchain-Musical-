// SPDX-License-Identifier: Apache-2.0
/*
 * El smart contract desplegable vive en:
 *   chaincode/music-royalty/
 *
 * No importar este archivo desde la API: el chaincode se ejecuta
 * dentro de los contenedores de Hyperledger Fabric.
 */
'use strict';

module.exports = {
  location: 'chaincode/music-royalty',
  name: 'music-royalty'
};
