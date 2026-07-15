'use strict';

/**
 * Genera connection.json e importa identidad appUser en la wallet
 * a partir de los certificados cryptogen de User1@org1.example.com
 */
const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const NETWORK_ROOT = path.join(PROJECT_ROOT, 'network');
const ORG_PATH = path.join(
  NETWORK_ROOT,
  'organizations',
  'peerOrganizations',
  'org1.example.com'
);
const USER_MSP = path.join(ORG_PATH, 'users', 'User1@org1.example.com', 'msp');
const PEER_TLS = path.join(ORG_PATH, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
const ORDERER_TLS = path.join(
  NETWORK_ROOT,
  'organizations',
  'ordererOrganizations',
  'example.com',
  'orderers',
  'orderer.example.com',
  'tls',
  'ca.crt'
);
const CA_TLS_DIR = path.join(NETWORK_ROOT, 'organizations', 'fabric-ca', 'org1');

function readCertFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function findIdentityCert(mspPath) {
  const signcerts = path.join(mspPath, 'signcerts');
  const files = fs.readdirSync(signcerts).filter((f) => f.endsWith('.pem') || f.endsWith('.crt'));
  if (!files.length) {
    throw new Error(`No se encontró certificado en ${signcerts}`);
  }
  return path.join(signcerts, files[0]);
}

function findPrivateKey(mspPath) {
  const keystore = path.join(mspPath, 'keystore');
  const files = fs.readdirSync(keystore);
  if (!files.length) {
    throw new Error(`No se encontró clave privada en ${keystore}`);
  }
  return path.join(keystore, files[0]);
}

function buildConnectionProfile({ peerHost, ordererHost, caHost }) {
  const peerTlsPem = readCertFile(PEER_TLS);
  const ordererTlsPem = readCertFile(ORDERER_TLS);

  let caTlsPem = peerTlsPem;
  const possibleCaCerts = [
    path.join(CA_TLS_DIR, 'ca-cert.pem'),
    path.join(CA_TLS_DIR, 'tls-cert.pem')
  ];
  for (const p of possibleCaCerts) {
    if (fs.existsSync(p)) {
      caTlsPem = readCertFile(p);
      break;
    }
  }

  return {
    name: 'music-royalty-network',
    version: '1.0.0',
    client: {
      organization: 'Org1',
      connection: {
        timeout: {
          peer: { endorser: '300' }
        }
      }
    },
    organizations: {
      Org1: {
        mspid: 'Org1MSP',
        peers: ['peer0.org1.example.com'],
        certificateAuthorities: ['ca.org1.example.com']
      }
    },
    peers: {
      'peer0.org1.example.com': {
        url: `grpcs://${peerHost}:7051`,
        tlsCACerts: { pem: peerTlsPem },
        grpcOptions: {
          'ssl-target-name-override': 'peer0.org1.example.com',
          hostnameOverride: 'peer0.org1.example.com'
        }
      }
    },
    orderers: {
      'orderer.example.com': {
        url: `grpcs://${ordererHost}:7050`,
        tlsCACerts: { pem: ordererTlsPem },
        grpcOptions: {
          'ssl-target-name-override': 'orderer.example.com',
          hostnameOverride: 'orderer.example.com'
        }
      }
    },
    certificateAuthorities: {
      'ca.org1.example.com': {
        url: `https://${caHost}:7054`,
        caName: 'ca-org1',
        tlsCACerts: { pem: caTlsPem },
        httpOptions: { verify: false }
      }
    }
  };
}

async function importAppUser() {
  const walletPath = path.join(PROJECT_ROOT, 'wallet');
  fs.mkdirSync(walletPath, { recursive: true });

  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const identityLabel = 'appUser';

  const existing = await wallet.get(identityLabel);
  if (existing) {
    console.log(`[OK] Identidad '${identityLabel}' ya existe en wallet`);
    return;
  }

  if (!fs.existsSync(USER_MSP)) {
    throw new Error(
      `No existe MSP de User1 en ${USER_MSP}. Ejecuta primero network/scripts/network.sh generate|up`
    );
  }

  const cert = readCertFile(findIdentityCert(USER_MSP));
  const key = readCertFile(findPrivateKey(USER_MSP));

  const identity = {
    credentials: { certificate: cert, privateKey: key },
    mspId: 'Org1MSP',
    type: 'X.509'
  };

  await wallet.put(identityLabel, identity);
  console.log(`[OK] Identidad '${identityLabel}' importada en ${walletPath}`);
}

async function main() {
  console.log('=== Generando connection.json y wallet ===');

  if (!fs.existsSync(PEER_TLS) || !fs.existsSync(ORDERER_TLS)) {
    throw new Error('Certificados TLS no encontrados. Genera la red primero (FABRIC-UP.bat)');
  }

  // Perfil para API en el HOST (Windows) → localhost
  const connectionHost = buildConnectionProfile({
    peerHost: 'localhost',
    ordererHost: 'localhost',
    caHost: 'localhost'
  });
  const connectionPath = path.join(PROJECT_ROOT, 'connection.json');
  fs.writeFileSync(connectionPath, JSON.stringify(connectionHost, null, 2));
  console.log(`[OK] connection.json (host/localhost) → ${connectionPath}`);

  // Perfil para API en Docker dentro de la red Fabric → DNS de contenedores
  const connectionDocker = buildConnectionProfile({
    peerHost: 'peer0.org1.example.com',
    ordererHost: 'orderer.example.com',
    caHost: 'ca_org1'
  });
  const connectionDockerPath = path.join(PROJECT_ROOT, 'connection-docker.json');
  fs.writeFileSync(connectionDockerPath, JSON.stringify(connectionDocker, null, 2));
  console.log(`[OK] connection-docker.json (red Docker) → ${connectionDockerPath}`);

  const profileDir = path.join(NETWORK_ROOT, 'connection-profile');
  fs.mkdirSync(profileDir, { recursive: true });
  fs.writeFileSync(
    path.join(profileDir, 'connection-org1.json'),
    JSON.stringify(connectionHost, null, 2)
  );

  await importAppUser();
  console.log('=== Listo ===');
}

main().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
