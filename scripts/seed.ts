import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ===== USUARIOS =====
  const hashedPw = await bcrypt.hash('XO@hG7fcWZ', 10)
  const hashedPwUsers = await bcrypt.hash('Delvalle2024!', 10)

  const adminTest = await prisma.user.upsert({
    where: { email: 'abacus-8caef505@example.com' },
    update: {},
    create: {
      email: 'abacus-8caef505@example.com',
      name: 'Admin Test',
      password: hashedPw,
      rol: 'ADMIN',
    },
  })

  const jefeObras = await prisma.user.upsert({
    where: { email: 'jefe.obras@delvalle.cr' },
    update: {},
    create: {
      email: 'jefe.obras@delvalle.cr',
      name: 'Carlos Mora - Jefe de Obras',
      password: hashedPwUsers,
      rol: 'JEFATURA_AREA',
    },
  })

  const jefeCompras = await prisma.user.upsert({
    where: { email: 'jefe.compras@delvalle.cr' },
    update: {},
    create: {
      email: 'jefe.compras@delvalle.cr',
      name: 'Laura Rojas - Jefa de Compras',
      password: hashedPwUsers,
      rol: 'JEFATURA_COMPRAS',
    },
  })

  const gerenteFinanciero = await prisma.user.upsert({
    where: { email: 'gerente.financiero@delvalle.cr' },
    update: {},
    create: {
      email: 'gerente.financiero@delvalle.cr',
      name: 'Roberto Vargas - Gerente Financiero',
      password: hashedPwUsers,
      rol: 'GERENCIA_FINANCIERA',
    },
  })

  const gerenteGeneral = await prisma.user.upsert({
    where: { email: 'gerente.general@delvalle.cr' },
    update: {},
    create: {
      email: 'gerente.general@delvalle.cr',
      name: 'Ana Chacón - Gerente General',
      password: hashedPwUsers,
      rol: 'GERENCIA_GENERAL',
    },
  })

  const bodeguero = await prisma.user.upsert({
    where: { email: 'bodega@delvalle.cr' },
    update: {},
    create: {
      email: 'bodega@delvalle.cr',
      name: 'Mario Sánchez - Bodeguero',
      password: hashedPwUsers,
      rol: 'BODEGUERO',
    },
  })

  console.log('Usuarios creados')

  // ===== MATERIALES =====
  const cemento = await prisma.material.upsert({
    where: { codigo: 'MAT-001' },
    update: {},
    create: {
      codigo: 'MAT-001',
      nombre: 'Cemento gris 50 kg',
      unidad: 'sacos',
      demandaPromDia: 40,
      demandaMaxDia: 55,
      tiempoEntregaDias: 3,
      stockMaximo: 500,
      ubicacion: 'Bodega Principal - Sección A',
    },
  })

  const varilla = await prisma.material.upsert({
    where: { codigo: 'MAT-002' },
    update: {},
    create: {
      codigo: 'MAT-002',
      nombre: 'Varilla #3 grado 40',
      unidad: 'unidades',
      demandaPromDia: 120,
      demandaMaxDia: 160,
      tiempoEntregaDias: 5,
      stockMaximo: 2000,
      ubicacion: 'Bodega Principal - Sección B',
    },
  })

  const block = await prisma.material.upsert({
    where: { codigo: 'MAT-003' },
    update: {},
    create: {
      codigo: 'MAT-003',
      nombre: 'Block 12×20×40',
      unidad: 'unidades',
      demandaPromDia: 600,
      demandaMaxDia: 900,
      tiempoEntregaDias: 4,
      stockMaximo: 5000,
      ubicacion: 'Patio Exterior',
    },
  })

  const arena = await prisma.material.upsert({
    where: { codigo: 'MAT-004' },
    update: {},
    create: {
      codigo: 'MAT-004',
      nombre: 'Arena (m³)',
      unidad: 'm³',
      demandaPromDia: 6,
      demandaMaxDia: 10,
      tiempoEntregaDias: 2,
      stockMaximo: 50,
      ubicacion: 'Patio Exterior - Acopio',
    },
  })

  console.log('Materiales creados')

  // ===== PROVEEDORES =====
  const provA = await prisma.proveedor.upsert({
    where: { codigo: 'PROV-A' },
    update: {},
    create: { codigo: 'PROV-A', nombre: 'Proveedor A - Cementos del Pacífico', contacto: 'Juan Pérez', telefono: '2222-1111', email: 'ventas@cempac.cr' },
  })
  const provB = await prisma.proveedor.upsert({
    where: { codigo: 'PROV-B' },
    update: {},
    create: { codigo: 'PROV-B', nombre: 'Proveedor B - Materiales Unidos', contacto: 'María López', telefono: '2222-2222', email: 'ventas@matunidos.cr' },
  })
  const provC = await prisma.proveedor.upsert({
    where: { codigo: 'PROV-C' },
    update: {},
    create: { codigo: 'PROV-C', nombre: 'Proveedor C - Aceros Nacionales', contacto: 'Pedro Ramírez', telefono: '2222-3333', email: 'ventas@aceronac.cr' },
  })
  const provD = await prisma.proveedor.upsert({
    where: { codigo: 'PROV-D' },
    update: {},
    create: { codigo: 'PROV-D', nombre: 'Proveedor D - Ferretotalsa', contacto: 'Luis Álvarez', telefono: '2222-4444', email: 'ventas@ferretotalsa.cr' },
  })
  const provE = await prisma.proveedor.upsert({
    where: { codigo: 'PROV-E' },
    update: {},
    create: { codigo: 'PROV-E', nombre: 'Proveedor E - Seguridad Industrial CR', contacto: 'Ana Solano', telefono: '2222-5555', email: 'ventas@seguridadcr.cr' },
  })
  const provF = await prisma.proveedor.upsert({
    where: { codigo: 'PROV-F' },
    update: {},
    create: { codigo: 'PROV-F', nombre: 'Proveedor F - EPP Solutions', contacto: 'Diego Murillo', telefono: '2222-6666', email: 'ventas@eppsolutions.cr' },
  })
  // Proveedor G for blocks/arena
  const provG = await prisma.proveedor.upsert({
    where: { codigo: 'PROV-G' },
    update: {},
    create: { codigo: 'PROV-G', nombre: 'Proveedor G - Bloques del Valle', contacto: 'Fernando Quesada', telefono: '2222-7777', email: 'ventas@bloquesdelvalle.cr' },
  })

  console.log('Proveedores creados')

  // ===== ÓRDENES DE COMPRA DE OCTUBRE =====
  // Necesitamos crear OCs y movimientos que resulten en los stocks del ejercicio:
  // Cemento: 190 sacos, Varilla: 850 unid, Block: 2800 unid, Arena: 14 m³

  // OC-1041: 02/10, Obras, Prov A, Cemento, 200, ₡6,450 (DUPLICADO + SOBREPRECIO, contrato es 6300)
  const oc1041 = await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1041' },
    update: {},
    create: {
      numeroOC: 'OC-1041',
      fecha: new Date('2024-10-02'),
      area: 'Obras',
      proveedorId: provA.id,
      estado: 'APROBADA',
      nivelAprobacionReq: 'JEFATURA_COMPRAS', // 200*6450=1,290,000
      montoTotal: 1290000,
      lineas: {
        create: [{ materialId: cemento.id, cantidad: 200, precioUnitario: 6450, precioContrato: 6300 }],
      },
    },
  })

  // OC-1042: 02/10, Obras, Prov A, Cemento, 200, ₡6,450 (DUPLICADO)
  const oc1042 = await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1042' },
    update: {},
    create: {
      numeroOC: 'OC-1042',
      fecha: new Date('2024-10-02'),
      area: 'Obras',
      proveedorId: provA.id,
      estado: 'APROBADA',
      nivelAprobacionReq: 'JEFATURA_COMPRAS',
      montoTotal: 1290000,
      lineas: {
        create: [{ materialId: cemento.id, cantidad: 200, precioUnitario: 6450, precioContrato: 6300 }],
      },
    },
  })

  // OC-1047: 06/10, Mant, Prov B, Cemento, 40, ₡7,100 (FUERA DE CONTRATO)
  const oc1047 = await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1047' },
    update: {},
    create: {
      numeroOC: 'OC-1047',
      fecha: new Date('2024-10-06'),
      area: 'Mantenimiento',
      proveedorId: provB.id,
      estado: 'APROBADA',
      nivelAprobacionReq: 'JEFATURA_AREA', // 40*7100=284,000 -> JEFATURA_COMPRAS
      montoTotal: 284000,
      lineas: {
        create: [{ materialId: cemento.id, cantidad: 40, precioUnitario: 7100, precioContrato: 6300 }],
      },
    },
  })

  // OC-1050: 08/10, Obras, Prov C, Varilla, 500, ₡2,150 (FUERA DE CONTRATO, contrato 2050)
  const oc1050 = await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1050' },
    update: {},
    create: {
      numeroOC: 'OC-1050',
      fecha: new Date('2024-10-08'),
      area: 'Obras',
      proveedorId: provC.id,
      estado: 'APROBADA',
      nivelAprobacionReq: 'JEFATURA_COMPRAS', // 500*2150=1,075,000
      montoTotal: 1075000,
      lineas: {
        create: [{ materialId: varilla.id, cantidad: 500, precioUnitario: 2150, precioContrato: 2050 }],
      },
    },
  })

  // OC-1053: 09/10, Obras, Prov C, Varilla, 480, ₡2,150 (FUERA DE CONTRATO)
  const oc1053 = await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1053' },
    update: {},
    create: {
      numeroOC: 'OC-1053',
      fecha: new Date('2024-10-09'),
      area: 'Obras',
      proveedorId: provC.id,
      estado: 'APROBADA',
      nivelAprobacionReq: 'JEFATURA_COMPRAS', // 480*2150=1,032,000
      montoTotal: 1032000,
      lineas: {
        create: [{ materialId: varilla.id, cantidad: 480, precioUnitario: 2150, precioContrato: 2050 }],
      },
    },
  })

  // OC-1058: 13/10, Mant, Prov D, Varilla, 60, ₡2,600 (FUERA DE CONTRATO)
  const oc1058 = await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1058' },
    update: {},
    create: {
      numeroOC: 'OC-1058',
      fecha: new Date('2024-10-13'),
      area: 'Mantenimiento',
      proveedorId: provD.id,
      estado: 'APROBADA',
      nivelAprobacionReq: 'JEFATURA_AREA', // 60*2600=156,000
      montoTotal: 156000,
      lineas: {
        create: [{ materialId: varilla.id, cantidad: 60, precioUnitario: 2600, precioContrato: 2050 }],
      },
    },
  })

  // OC-1061: 15/10, Bodega, Prov A, Cemento, 300, ₡6,300 (PRECIO CONTRATO - OK)
  const oc1061 = await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1061' },
    update: {},
    create: {
      numeroOC: 'OC-1061',
      fecha: new Date('2024-10-15'),
      area: 'Bodega',
      proveedorId: provA.id,
      estado: 'APROBADA',
      nivelAprobacionReq: 'JEFATURA_COMPRAS', // 300*6300=1,890,000
      montoTotal: 1890000,
      lineas: {
        create: [{ materialId: cemento.id, cantidad: 300, precioUnitario: 6300, precioContrato: 6300 }],
      },
    },
  })

  // Una OC pendiente para demostrar la matriz de aprobación
  await prisma.ordenCompra.upsert({
    where: { numeroOC: 'OC-1065' },
    update: {},
    create: {
      numeroOC: 'OC-1065',
      fecha: new Date('2024-10-20'),
      area: 'Obras',
      proveedorId: provG.id,
      estado: 'PENDIENTE_APROBACION',
      nivelAprobacionReq: 'GERENCIA_FINANCIERA', // 3000*1500=4,500,000
      montoTotal: 4500000,
      lineas: {
        create: [{ materialId: block.id, cantidad: 3000, precioUnitario: 1500, precioContrato: null }],
      },
    },
  })

  console.log('Órdenes de compra creadas')

  // ===== MOVIMIENTOS =====
  // Entradas por OC (ya aprobadas)
  // Cemento: OC-1041(200) + OC-1042(200) + OC-1047(40) + OC-1061(300) = 740 entradas
  // Para stock=190 => salidas necesarias = 740-190 = 550
  const cementoEntradas = [
    { doc: 'OC-1041', cant: 200, fecha: '2024-10-03' },
    { doc: 'OC-1042', cant: 200, fecha: '2024-10-03' },
    { doc: 'OC-1047', cant: 40, fecha: '2024-10-08' },
    { doc: 'OC-1061', cant: 300, fecha: '2024-10-17' },
  ]
  for (const e of cementoEntradas) {
    await prisma.movimiento.create({
      data: {
        materialId: cemento.id, tipo: 'ENTRADA', cantidad: e.cant,
        fecha: new Date(e.fecha), usuarioId: bodeguero.id,
        documentoOrigen: e.doc, ubicacionDestino: 'Bodega Principal - Sección A',
        notas: `Recepción de material por ${e.doc}`,
      },
    })
  }
  // Salidas cemento para llegar a 190
  const cementoSalidas = [
    { cant: 200, fecha: '2024-10-05', doc: 'VS-101', nota: 'Despacho a Proyecto Residencial Los Robles' },
    { cant: 160, fecha: '2024-10-10', doc: 'VS-108', nota: 'Despacho a Proyecto Condominios del Este' },
    { cant: 120, fecha: '2024-10-18', doc: 'VS-115', nota: 'Despacho a Proyecto Centro Comercial Plaza' },
    { cant: 70, fecha: '2024-10-22', doc: 'VS-120', nota: 'Despacho a Proyecto Puente Río Segundo' },
  ]
  for (const s of cementoSalidas) {
    await prisma.movimiento.create({
      data: {
        materialId: cemento.id, tipo: 'SALIDA', cantidad: s.cant,
        fecha: new Date(s.fecha), usuarioId: bodeguero.id,
        documentoOrigen: s.doc, ubicacionOrigen: 'Bodega Principal - Sección A',
        notas: s.nota,
      },
    })
  }

  // Varilla: OC-1050(500) + OC-1053(480) + OC-1058(60) = 1040 entradas
  // Para stock=850 => salidas = 1040-850 = 190
  const varillaEntradas = [
    { doc: 'OC-1050', cant: 500, fecha: '2024-10-13' },
    { doc: 'OC-1053', cant: 480, fecha: '2024-10-14' },
    { doc: 'OC-1058', cant: 60, fecha: '2024-10-18' },
  ]
  for (const e of varillaEntradas) {
    await prisma.movimiento.create({
      data: {
        materialId: varilla.id, tipo: 'ENTRADA', cantidad: e.cant,
        fecha: new Date(e.fecha), usuarioId: bodeguero.id,
        documentoOrigen: e.doc, ubicacionDestino: 'Bodega Principal - Sección B',
        notas: `Recepción de varilla por ${e.doc}`,
      },
    })
  }
  // Salidas varilla
  await prisma.movimiento.create({
    data: {
      materialId: varilla.id, tipo: 'SALIDA', cantidad: 190,
      fecha: new Date('2024-10-20'), usuarioId: bodeguero.id,
      documentoOrigen: 'VS-118', ubicacionOrigen: 'Bodega Principal - Sección B',
      notas: 'Despacho a Proyecto Residencial Los Robles - Armado estructural',
    },
  })

  // Block: necesitamos stock = 2800. Creamos entradas y salidas
  await prisma.movimiento.create({
    data: {
      materialId: block.id, tipo: 'ENTRADA', cantidad: 5000,
      fecha: new Date('2024-10-01'), usuarioId: bodeguero.id,
      documentoOrigen: 'OC-1035', ubicacionDestino: 'Patio Exterior',
      notas: 'Recepción de blocks - pedido mensual',
    },
  })
  await prisma.movimiento.create({
    data: {
      materialId: block.id, tipo: 'SALIDA', cantidad: 2200,
      fecha: new Date('2024-10-15'), usuarioId: bodeguero.id,
      documentoOrigen: 'VS-112', ubicacionOrigen: 'Patio Exterior',
      notas: 'Despacho a Proyecto Condominios del Este - Mampostería',
    },
  })

  // Arena: necesitamos stock = 14 m³
  await prisma.movimiento.create({
    data: {
      materialId: arena.id, tipo: 'ENTRADA', cantidad: 30,
      fecha: new Date('2024-10-01'), usuarioId: bodeguero.id,
      documentoOrigen: 'OC-1038', ubicacionDestino: 'Patio Exterior - Acopio',
      notas: 'Recepción de arena - pedido quincenal',
    },
  })
  await prisma.movimiento.create({
    data: {
      materialId: arena.id, tipo: 'SALIDA', cantidad: 16,
      fecha: new Date('2024-10-18'), usuarioId: bodeguero.id,
      documentoOrigen: 'VS-116', ubicacionOrigen: 'Patio Exterior - Acopio',
      notas: 'Despacho arena para mezcla - Proyecto Puente Río Segundo',
    },
  })

  console.log('Movimientos creados')

  // ===== ALERTAS =====
  // Cemento: SS=45, PR=165. Stock=190 > PR=165 => OK (pero cerca)
  // Varilla: SS=200, PR=800. Stock=850 > PR=800 => OK (cerca, alerta)
  // Block: SS=1200, PR=3600. Stock=2800 < PR=3600 => CRÍTICO
  // Arena: SS=8, PR=20. Stock=14 < PR=20 => CRÍTICO

  await prisma.alerta.create({
    data: {
      materialId: block.id,
      tipo: 'REORDEN',
      mensaje: 'Stock de Block 12×20×40 (2,800 unidades) bajo punto de reorden (3,600 unidades). Solicitar reabastecimiento urgente.',
    },
  })

  await prisma.alerta.create({
    data: {
      materialId: arena.id,
      tipo: 'REORDEN',
      mensaje: 'Stock de Arena (14 m³) bajo punto de reorden (20 m³). Solicitar reabastecimiento.',
    },
  })

  await prisma.alerta.create({
    data: {
      materialId: cemento.id,
      tipo: 'DUPLICADO',
      mensaje: 'Posible duplicado detectado: OC-1041 y OC-1042 - Mismo proveedor (A), mismo material (Cemento), misma cantidad (200), misma fecha (02/10).',
    },
  })

  await prisma.alerta.create({
    data: {
      materialId: cemento.id,
      tipo: 'SOBREPRECIO',
      mensaje: 'OC-1041 y OC-1042: Precio unitario ₡6,450 excede precio contrato ₡6,300 (+₡150/saco, +2.4%).',
    },
  })

  await prisma.alerta.create({
    data: {
      materialId: cemento.id,
      tipo: 'SOBREPRECIO',
      mensaje: 'OC-1047: Compra fuera de contrato a Proveedor B. Precio ₡7,100 vs contrato ₡6,300 (+₡800/saco, +12.7%).',
    },
  })

  console.log('Alertas creadas')
  console.log('\n=== Seed completado exitosamente ===')
  console.log('Stocks resultantes:')
  console.log('- Cemento: 740-550 = 190 sacos')
  console.log('- Varilla: 1040-190 = 850 unidades')
  console.log('- Block: 5000-2200 = 2800 unidades')
  console.log('- Arena: 30-16 = 14 m³')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
