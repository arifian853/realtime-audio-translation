import { HiSpeakerWave } from "react-icons/hi2";

export const ChatA = () => {
    return (
        <div className="flex items-center gap-2 m-3 mx-5">
            <div className="bg-[#B4C5E4] rounded-md p-3 w-auto">
                Selamat pagi, tuan!
                Semoga hari anda menyenangkan!
            </div>
            <span className="text-xl"><HiSpeakerWave /></span>
        </div>
    )
}
