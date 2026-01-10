import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import algeriaData from '../utils/algeria.json';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface AlgeriaCity {
  id: number;
  commune_name_ascii: string;
  commune_name: string;
  daira_name_ascii: string;
  daira_name: string;
  wilaya_code: string;
  wilaya_name_ascii: string;
  wilaya_name: string;
}

async function seedAlgeria() {
  try {
    console.log('🌱 Starting Algeria seeder...');

    // Find or create Algeria country
    let algeria = await prisma.country.findFirst({
      where: { name: 'Algeria' }
    });

    if (!algeria) {
      algeria = await prisma.country.create({
        data: {
          name: 'Algeria'
        }
      });
      console.log('✅ Created Algeria country');
    } else {
      console.log('✅ Algeria country already exists');
    }

    // Group cities by wilaya (state)
    const statesMap = new Map<string, {
      wilaya_name_ascii: string;
      wilaya_name: string;
      wilaya_code: string;
      cities: AlgeriaCity[];
    }>();

    (algeriaData as AlgeriaCity[]).forEach((city) => {
      const stateKey = city.wilaya_code;
      
      if (!statesMap.has(stateKey)) {
        statesMap.set(stateKey, {
          wilaya_name_ascii: city.wilaya_name_ascii,
          wilaya_name: city.wilaya_name,
          wilaya_code: city.wilaya_code,
          cities: []
        });
      }
      
      statesMap.get(stateKey)!.cities.push(city);
    });

    console.log(`📊 Found ${statesMap.size} states (wilayas)`);

    // Validate country exists
    if (!algeria || !algeria.id) {
      throw new Error('Algeria country not found or invalid');
    }

    // Create states and cities
    let totalStatesCreated = 0;
    let totalStatesUpdated = 0;
    let totalCitiesCreated = 0;

    for (const [code, stateData] of statesMap.entries()) {
      // Validate required fields
      if (!code || !stateData.wilaya_name_ascii || !stateData.wilaya_name) {
        console.warn(`⚠️  Skipping invalid state data: code=${code}, name=${stateData.wilaya_name_ascii}`);
        continue;
      }

      // Check if state already exists
      let state = await prisma.state.findFirst({
        where: {
          countryId: algeria.id,
          code: code
        }
      });

      if (state) {
        // Update existing state with Arabic name if missing
        state = await prisma.state.update({
          where: { id: state.id },
          data: {
            name: stateData.wilaya_name_ascii,
            nameAr: stateData.wilaya_name,
            code: code
          }
        });
        totalStatesUpdated++;
        console.log(`🔄 Updated state: ${stateData.wilaya_name_ascii} (${code})`);
      } else {
        // Create new state
        state = await prisma.state.create({
          data: {
            countryId: algeria.id,
            code: String(code).trim(),
            name: String(stateData.wilaya_name_ascii).trim(),
            nameAr: String(stateData.wilaya_name).trim()
          }
        });
        totalStatesCreated++;
        console.log(`✅ Created state: ${stateData.wilaya_name_ascii} (${code})`);
      }

      // Create cities for this state
      for (const cityData of stateData.cities) {
        // Check if city already exists
        const existingCity = await prisma.city.findFirst({
          where: {
            stateId: state.id,
            name: cityData.commune_name_ascii
          }
        });

        if (!existingCity) {
          await prisma.city.create({
            data: {
              stateId: state.id,
              name: cityData.commune_name_ascii,
              nameAr: cityData.commune_name
            }
          });
          totalCitiesCreated++;
        }
      }

      console.log(`  📍 Created/verified ${stateData.cities.length} cities for ${stateData.wilaya_name_ascii}`);
    }

    console.log('\n✨ Seeding completed!');
    console.log(`📈 Summary:`);
    console.log(`   - States created: ${totalStatesCreated}`);
    console.log(`   - States updated: ${totalStatesUpdated}`);
    console.log(`   - Cities created: ${totalCitiesCreated}`);
    console.log(`   - Total states: ${statesMap.size}`);
    console.log(`   - Total cities: ${(algeriaData as AlgeriaCity[]).length}`);

  } catch (error) {
    console.error('❌ Error seeding Algeria data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAlgeria()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

