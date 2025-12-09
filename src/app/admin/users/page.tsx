'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Loader from '@/components/ui/Loader';
import Image from 'next/image';
import Flag from 'react-world-flags';

// Admin user IDs
const ADMIN_USERS = ['FaLWjIwujeghy34NGelI0rrB7Vk2'];

// Function to get country code for FlagKit from country name
const getCountryCode = (country: string): string => {
  const countryCodes: { [key: string]: string } = {
    'United States': 'US',
    'USA': 'US',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Poland': 'PL',
    'Russia': 'RU',
    'China': 'CN',
    'Japan': 'JP',
    'South Korea': 'KR',
    'India': 'IN',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'Mexico': 'MX',
    'South Africa': 'ZA',
    'Kenya': 'KE',
    'Nigeria': 'NG',
    'Egypt': 'EG',
    'Turkey': 'TR',
    'Israel': 'IL',
    'Saudi Arabia': 'SA',
    'UAE': 'AE',
    'Singapore': 'SG',
    'Malaysia': 'MY',
    'Thailand': 'TH',
    'Philippines': 'PH',
    'Indonesia': 'ID',
    'New Zealand': 'NZ',
    'Ireland': 'IE',
    'Portugal': 'PT',
    'Greece': 'GR',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Serbia': 'RS',
    'Ukraine': 'UA',
    'Belarus': 'BY',
    'Estonia': 'EE',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Chile': 'CL',
    'Peru': 'PE',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'Uruguay': 'UY',
    'Pakistan': 'PK',
    'Bangladesh': 'BD',
    'Sri Lanka': 'LK',
    'Myanmar': 'MM',
    'Cambodia': 'KH',
    'Laos': 'LA',
    'Vietnam': 'VN',
    'Morocco': 'MA',
    'Tunisia': 'TN',
    'Libya': 'LY',
    'Algeria': 'DZ',
    'Sudan': 'SD',
    'Ethiopia': 'ET',
    'Ghana': 'GH',
    'Ivory Coast': 'CI',
    'Senegal': 'SN',
    'Mali': 'ML',
    'Burkina Faso': 'BF',
    'Niger': 'NE',
    'Chad': 'TD',
    'Cameroon': 'CM',
    'Congo': 'CG',
    'Uganda': 'UG',
    'Tanzania': 'TZ',
    'Rwanda': 'RW',
    'Burundi': 'BI',
    'Mozambique': 'MZ',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW',
    'Botswana': 'BW',
    'Namibia': 'NA',
    'Angola': 'AO',
    'Madagascar': 'MG',
    'Somalia': 'SO',
    'Djibouti': 'DJ',
    'Eritrea': 'ER',
    'Gambia': 'GM',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Sierra Leone': 'SL',
    'Liberia': 'LR',
    'Togo': 'TG',
    'Benin': 'BJ',
    'Central African Republic': 'CF',
    'Equatorial Guinea': 'GQ',
    'Gabon': 'GA',
    'Congo Republic': 'CG',
    'Democratic Republic of Congo': 'CD',
    'Seychelles': 'SC',
    'Mauritius': 'MU',
    'Comoros': 'KM',
    'Cape Verde': 'CV',
    'Qatar': 'QA',
    'Kuwait': 'KW',
    'Bahrain': 'BH',
    'Oman': 'OM',
    'Jordan': 'JO',
    'Lebanon': 'LB',
    'Syria': 'SY',
    'Iraq': 'IQ',
    'Yemen': 'YE',
    'Afghanistan': 'AF',
    'Iran': 'IR',
    'Kazakhstan': 'KZ',
    'Uzbekistan': 'UZ',
    'Turkmenistan': 'TM',
    'Kyrgyzstan': 'KG',
    'Tajikistan': 'TJ',
    'Mongolia': 'MN',
    'Nepal': 'NP',
    'Bhutan': 'BT',
    'Maldives': 'MV',
    'Cyprus': 'CY',
    'Malta': 'MT',
    'Luxembourg': 'LU',
    'Monaco': 'MC',
    'Andorra': 'AD',
    'San Marino': 'SM',
    'Vatican City': 'VA',
    'Liechtenstein': 'LI',
    'Iceland': 'IS',
    'Faroe Islands': 'FO',
    'Greenland': 'GL',
    'Puerto Rico': 'PR',
    'Guam': 'GU',
    'US Virgin Islands': 'VI',
    'American Samoa': 'AS',
    'Northern Mariana Islands': 'MP',
    'Cook Islands': 'CK',
    'Fiji': 'FJ',
    'Solomon Islands': 'SB',
    'Vanuatu': 'VU',
    'Samoa': 'WS',
    'Tonga': 'TO',
    'Kiribati': 'KI',
    'Tuvalu': 'TV',
    'Nauru': 'NR',
    'Palau': 'PW',
    'Marshall Islands': 'MH',
    'Micronesia': 'FM',
    'Barbados': 'BB',
    'Trinidad and Tobago': 'TT',
    'Jamaica': 'JM',
    'Bahamas': 'BS',
    'Dominican Republic': 'DO',
    'Haiti': 'HT',
    'Cuba': 'CU',
    'Costa Rica': 'CR',
    'Panama': 'PA',
    'Guatemala': 'GT',
    'Honduras': 'HN',
    'El Salvador': 'SV',
    'Nicaragua': 'NI',
    'Belize': 'BZ',
    'Guyana': 'GY',
    'Suriname': 'SR',
    'Ecuador': 'EC',
    'Bolivia': 'BO',
    'Paraguay': 'PY',
    'Aruba': 'AW',
    'Curacao': 'CW',
    'Sint Maarten': 'SX',
    'Bonaire': 'BQ',
    'Saint Martin': 'MF',
    'Saint Barthélemy': 'BL',
    'Saint Kitts and Nevis': 'KN',
    'Antigua and Barbuda': 'AG',
    'Dominica': 'DM',
    'Saint Lucia': 'LC',
    'Saint Vincent and the Grenadines': 'VC',
    'Grenada': 'GD',
    'Montserrat': 'MS',
    'Anguilla': 'AI',
    'British Virgin Islands': 'VG',
    'Cayman Islands': 'KY',
    'Turks and Caicos Islands': 'TC',
    'Bermuda': 'BM',
    'Falkland Islands': 'FK',
    'Gibraltar': 'GI',
    'Saint Helena': 'SH',
    'Ascension Island': 'AC',
    'Tristan da Cunha': 'TA',
    'Pitcairn Islands': 'PN',
    'Wallis and Futuna': 'WF',
    'French Polynesia': 'PF',
    'New Caledonia': 'NC',
    'French Guiana': 'GF',
    'Guadeloupe': 'GP',
    'Martinique': 'MQ',
    'Réunion': 'RE',
    'Mayotte': 'YT',
    'Saint Pierre and Miquelon': 'PM',
    'Åland Islands': 'AX',
    'Svalbard and Jan Mayen': 'SJ',
    'Bouvet Island': 'BV',
    'Heard Island and McDonald Islands': 'HM',
    'South Georgia and the South Sandwich Islands': 'GS',
    'British Indian Ocean Territory': 'IO',
    'Christmas Island': 'CX',
    'Cocos (Keeling) Islands': 'CC',
    'Norfolk Island': 'NF',
    'Niue': 'NU',
    'District of Columbia': 'US',
  };
  
  return countryCodes[country] || '';
};

interface UserData {
  uid: string;
  displayName?: string;
  nickname?: string;
  email?: string;
  photoURL?: string;
  createdAt?: any;
  country?: string;
  city?: string;
  address?: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user && ADMIN_USERS.includes(user.uid);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [isAdmin, router]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const userData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserData[];
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.nickname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.country?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Debug: Count users with location data
  const usersWithLocation = users.filter(user => user.country).length;
  console.log(`Users with location: ${usersWithLocation}/${users.length}`);

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Users Management</h1>
          <p className="text-gray-600">
            View all registered users on BXARCHI
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search by name, nickname, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Real Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nickname
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt="Profile"
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.nickname || 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email || 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.country ? (
                            <>
                              <div className="mr-2">
                                <Flag 
                                  code={getCountryCode(user.country)} 
                                  style={{ width: 24, height: 16 }}
                                  className="rounded shadow-sm"
                                />
                                {/* Fallback emoji flag for testing */}
                                <span className="ml-1 text-lg">
                                  {user.country === 'United States' ? '🇺🇸' : 
                                   user.country === 'Kenya' ? '🇰🇪' : '🏳️'}
                                </span>
                              </div>
                              <span className="text-sm text-gray-900">{user.country}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Not set</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.city || 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {user.address || 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.createdAt?.toDate()?.toLocaleDateString() || 'Unknown'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-indigo-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.displayName).length}
            </div>
            <div className="text-sm text-gray-600">Users with Display Name</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.nickname).length}
            </div>
            <div className="text-sm text-gray-600">Users with Nickname</div>
          </div>
        </div>
      </div>
    </div>
  );
}
