import DoctorFilterScreen from '@/components/doctor/doctor-filter-screen';
import { useRouter } from 'expo-router';

export default function DoctorFilterRoute() {
    const router = useRouter();

    const mockNavigation = {
        navigate: (screen: string) => {
            if (screen === 'DoctorInfo') router.push('/doctor/some-id' as any);
        },
        goBack: () => router.back(),
    };

    return <DoctorFilterScreen navigation={mockNavigation as any} />;
}
