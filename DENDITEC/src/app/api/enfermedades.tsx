import { Enfermedad } from '@/types/enfermedad'

export const enfermedades: Enfermedad[] = [
  {
    name: 'Caries Dental',
    slug: 'caries-dental',
    location: 'Afecta cualquier diente',
    rate: 'Nivel: Alto',
    severity: 4,
    frequency: 3,
    prevalence: 120,
    images: [
      {
        src: "/images/enfermedades/caries-dental/caries-dental.jpg",
      },
      {
        src: "/images/enfermedades/caries-dental/image-2.jpg"
      },
      {
        src: "/images/enfermedades/caries-dental/image-3.jpg"
      },
      {
        src: "/images/enfermedades/caries-dental/image-4.jpg"
      },
    ],
    description: {
      intro: "La caries dental es una de las enfermedades orales más comunes en el mundo",
      mainContent: [
        "La caries dental es causada por bacterias que producen ácidos que atacan el esmalte de los dientes. Estas bacterias se alimentan de azúcares y almidones de los alimentos que consumimos.",
        "Si no se trata, la caries puede progresar hasta afectar las capas más profundas del diente, causando dolor severo e incluso la pérdida del diente.",
        "La prevención incluye un buen cepillado, uso de hilo dental, enjuagues con flúor y visitas regulares al dentista.",
        "El tratamiento temprano puede incluir empastes, mientras que casos avanzados pueden requerir endodoncia o extracción."
      ],
      symptoms: [
        {
          title: "Dolor dental",
          description: "Dolor que puede ser constante o aparecer al comer dulces, alimentos fríos o calientes."
        },
        {
          title: "Sensibilidad",
          description: "Sensibilidad dental al consumir alimentos o bebidas frías, calientes o dulces."
        },
        {
          title: "Manchas visibles",
          description: "Manchas blancas, marrones o negras en la superficie de los dientes."
        }
      ],
      treatments: [
        {
          title: "Empastes",
          description: "Remoción del tejido cariado y relleno con material restaurativo."
        },
        {
          title: "Endodoncia",
          description: "Tratamiento de conducto para casos que afectan el nervio del diente."
        },
        {
          title: "Coronas",
          description: "Colocación de coronas para dientes severamente dañados."
        }
      ]
    }
  },
  {
    name: 'Sarro Dental',
    slug: 'sarro-dental',
    location: 'Línea de las encías',
    rate: 'Nivel: Moderado',
    severity: 5,
    frequency: 2,
    prevalence: 150,
    images: [
      {
        src: "/images/enfermedades/sarro-dental/sarro-dental.jpg",
      },
      {
        src: "/images/enfermedades/sarro-dental/image-2.jpg"
      },
      {
        src: "/images/enfermedades/sarro-dental/image-3.jpg"
      },
      {
        src: "/images/enfermedades/sarro-dental/image-4.jpg"
      },
    ],
    description: {
      intro: "El sarro dental es placa bacteriana mineralizada que se adhiere firmemente a los dientes",
      mainContent: [
        "El sarro se forma cuando la placa bacteriana no se remueve adecuadamente y se mineraliza con el tiempo. Es más común en la línea de las encías y entre los dientes.",
        "Una vez formado, el sarro no puede ser removido con el cepillado regular y requiere limpieza profesional por un dentista o higienista dental.",
        "El sarro puede causar inflamación de las encías, mal aliento y contribuir al desarrollo de enfermedades periodontales.",
        "La prevención es clave: cepillado adecuado, uso de hilo dental y limpiezas dentales regulares cada 6 meses."
      ],
      symptoms: [
        {
          title: "Depósitos duros",
          description: "Depósitos amarillentos o marrones duros en los dientes, especialmente cerca de las encías."
        },
        {
          title: "Mal aliento",
          description: "Halitosis persistente causada por bacterias acumuladas en el sarro."
        },
        {
          title: "Encías inflamadas",
          description: "Encías rojas, hinchadas o que sangran fácilmente al cepillarse."
        }
      ],
      treatments: [
        {
          title: "Limpieza dental",
          description: "Remoción profesional del sarro mediante ultrasonido y curetas."
        },
        {
          title: "Raspado radicular",
          description: "Limpieza profunda debajo de la línea de las encías en casos severos."
        },
        {
          title: "Mantenimiento",
          description: "Limpiezas regulares cada 3-6 meses para prevenir recurrencia."
        }
      ]
    }
  },
  {
    name: 'Decoloración Dental',
    slug: 'decoloracion-dental',
    location: 'Superficie dental',
    rate: 'Nivel: Leve',
    severity: 3,
    frequency: 4,
    prevalence: 180,
    images: [
      {
        src: "/images/enfermedades/decoloracion-dental/decoloracion-dental.jpg",
      },
      {
        src: "/images/enfermedades/decoloracion-dental/image-2.jpg"
      },
      {
        src: "/images/enfermedades/decoloracion-dental/image-3.jpg"
      },
      {
        src: "/images/enfermedades/decoloracion-dental/image-4.jpg"
      },
    ],
    description: {
      intro: "La decoloración dental afecta la apariencia estética de los dientes alterando su color natural",
      mainContent: [
        "La decoloración puede ser extrínseca (en la superficie) o intrínseca (dentro del diente). Las causas incluyen consumo de café, té, vino, tabaco y ciertos medicamentos.",
        "Los factores intrínsecos incluyen traumatismos dentales, fluorosis, medicamentos como tetraciclina durante el desarrollo dental, y el proceso natural de envejecimiento.",
        "Aunque principalmente es un problema estético, puede afectar la autoestima y confianza de las personas en sus relaciones sociales y profesionales.",
        "Existen múltiples opciones de tratamiento, desde blanqueamientos profesionales hasta carillas y coronas para casos severos."
      ],
      symptoms: [
        {
          title: "Manchas amarillentas",
          description: "Coloración amarilla generalizada, común con el envejecimiento y consumo de tabaco."
        },
        {
          title: "Manchas marrones",
          description: "Manchas oscuras causadas por café, té, vino tinto o caries."
        },
        {
          title: "Manchas blancas",
          description: "Manchas blancas por fluorosis o desmineralización inicial."
        }
      ],
      treatments: [
        {
          title: "Blanqueamiento dental",
          description: "Tratamiento con peróxidos para aclarar el color de los dientes."
        },
        {
          title: "Carillas",
          description: "Láminas cerámicas que cubren la superficie frontal de los dientes."
        },
        {
          title: "Coronas estéticas",
          description: "Fundas completas para dientes severamente decolorados."
        }
      ]
    }
  },
  {
    name: 'Úlceras Orales',
    slug: 'ulceras-orales',
    location: 'Mucosa oral',
    rate: 'Nivel: Moderado',
    severity: 6,
    frequency: 3,
    prevalence: 200,
    images: [
      {
        src: "/images/enfermedades/ulceras-orales/ulceras-orales.jpg",
      },
      {
        src: "/images/enfermedades/ulceras-orales/image-2.jpg"
      },
      {
        src: "/images/enfermedades/ulceras-orales/image-3.jpg"
      },
      {
        src: "/images/enfermedades/ulceras-orales/image-4.jpg"
      },
    ],
    description: {
      intro: "Las úlceras orales son lesiones dolorosas que afectan la mucosa de la boca",
      mainContent: [
        "Las úlceras orales pueden ser causadas por trauma, estrés, deficiencias nutricionales, enfermedades autoinmunes, infecciones virales o bacterianas.",
        "Las úlceras aftosas son las más comunes y tienden a recurrir. Aparecen como lesiones redondas u ovaladas con un centro blanquecino y bordes rojos.",
        "Aunque la mayoría son benignas y se curan solas en 1-2 semanas, pueden causar dolor significativo y dificultad para comer, beber o hablar.",
        "Es importante distinguir entre úlceras benignas y lesiones malignas, especialmente si persisten por más de 2-3 semanas."
      ],
      symptoms: [
        {
          title: "Dolor intenso",
          description: "Dolor punzante que se intensifica al comer, beber o hablar."
        },
        {
          title: "Lesiones visibles",
          description: "Úlceras redondas u ovaladas con centro blanco y bordes rojos."
        },
        {
          title: "Dificultad para comer",
          description: "Molestias al masticar, especialmente alimentos ácidos o picantes."
        }
      ],
      treatments: [
        {
          title: "Geles anestésicos",
          description: "Aplicación tópica para aliviar el dolor temporalmente."
        },
        {
          title: "Corticosteroides",
          description: "Medicamentos antiinflamatorios para reducir inflamación y dolor."
        },
        {
          title: "Enjuagues medicados",
          description: "Soluciones antisépticas para prevenir infecciones secundarias."
        }
      ]
    }
  },
  {
    name: 'Hipodoncia',
    slug: 'hipodoncia',
    location: 'Desarrollo dental',
    rate: 'Nivel: Alto',
    severity: 2,
    frequency: 1,
    prevalence: 90,
    images: [
      {
        src: "/images/enfermedades/hipodoncia/hipodoncia.jpg",
      },
      {
        src: "/images/enfermedades/hipodoncia/image-2.jpg"
      },
      {
        src: "/images/enfermedades/hipodoncia/image-3.jpg"
      },
      {
        src: "/images/enfermedades/hipodoncia/image-4.jpg"
      },
    ],
    description: {
      intro: "La hipodoncia es la ausencia congénita de uno o más dientes permanentes",
      mainContent: [
        "La hipodoncia es una anomalía del desarrollo que afecta aproximadamente al 3-10% de la población. Los dientes más comúnmente ausentes son los terceros molares, segundos premolares e incisivos laterales superiores.",
        "Esta condición puede ser hereditaria y a menudo se asocia con otros problemas dentales como dientes pequeños (microdoncia) o malposiciones dentales.",
        "Los espacios dejados por dientes ausentes pueden causar problemas funcionales como dificultades en la masticación, problemas en el habla y migración de dientes adyacentes.",
        "El tratamiento requiere un enfoque multidisciplinario que puede incluir ortodoncia, implantes, prótesis o combinaciones de estos tratamientos."
      ],
      symptoms: [
        {
          title: "Espacios vacíos",
          description: "Ausencia visible de uno o más dientes en la arcada dental."
        },
        {
          title: "Dientes de leche retenidos",
          description: "Persistencia de dientes temporales más allá de la edad normal de recambio."
        },
        {
          title: "Problemas de oclusión",
          description: "Dificultades en el encaje entre los dientes superiores e inferiores."
        }
      ],
      treatments: [
        {
          title: "Implantes dentales",
          description: "Colocación de implantes de titanio para reemplazar dientes ausentes."
        },
        {
          title: "Prótesis removibles",
          description: "Dentaduras parciales para reemplazar múltiples dientes ausentes."
        },
        {
          title: "Ortodoncia",
          description: "Cierre de espacios mediante movimiento ortodóntico cuando es posible."
        }
      ]
    }
  },
  {
    name: 'Gingivitis',
    slug: 'gingivitis',
    location: 'Encías',
    rate: 'Nivel: Moderado',
    severity: 4,
    frequency: 2,
    prevalence: 130,
    images: [
      {
        src: "/images/enfermedades/gingivitis/gingivitis.jpg",
      },
      {
        src: "/images/enfermedades/gingivitis/image-2.jpg"
      },
      {
        src: "/images/enfermedades/gingivitis/image-3.jpg"
      },
      {
        src: "/images/enfermedades/gingivitis/image-4.jpg"
      },
    ],
    description: {
      intro: "La gingivitis es la inflamación de las encías causada por acumulación de placa bacteriana",
      mainContent: [
        "La gingivitis es la forma más leve de enfermedad periodontal y es completamente reversible con el tratamiento adecuado. Es causada principalmente por mala higiene oral.",
        "Las bacterias en la placa producen toxinas que irritan las encías, causando inflamación, enrojecimiento y sangrado. Sin tratamiento, puede progresar a periodontitis.",
        "Factores de riesgo incluyen embarazo, diabetes, tabaquismo, medicamentos que reducen la saliva, y cambios hormonales.",
        "El tratamiento consiste en mejorar la higiene oral, limpiezas profesionales regulares y, en algunos casos, uso de enjuagues antimicrobianos."
      ],
      symptoms: [
        {
          title: "Encías rojas e hinchadas",
          description: "Inflamación visible de las encías con coloración rojiza intensa."
        },
        {
          title: "Sangrado al cepillarse",
          description: "Sangrado de las encías durante el cepillado o uso de hilo dental."
        },
        {
          title: "Mal aliento",
          description: "Halitosis persistente causada por bacterias y toxinas."
        }
      ],
      treatments: [
        {
          title: "Higiene oral mejorada",
          description: "Cepillado adecuado dos veces al día y uso diario de hilo dental."
        },
        {
          title: "Limpieza profesional",
          description: "Remoción de placa y sarro mediante limpieza dental profesional."
        },
        {
          title: "Enjuagues antimicrobianos",
          description: "Uso de enjuagues con clorhexidina para reducir bacterias."
        }
      ]
    }
  }
]
