import DoctorTabScreen from '@/components/doctor/doctor-filter-screen';
import { useRouter } from 'expo-router';

export default function DoctorFilterRoute() {
    const router = useRouter();

    const mockNavigation = {
        navigate: (screen: string, params?: any) => {
            if (screen === 'DoctorInfo') {
                router.push({
                    pathname: '/doctor/[id]',
                    params: params
                } as any);
            }
        },
        goBack: () => router.back(),
    };

    return <DoctorTabScreen navigation={mockNavigation as any} />;
}
