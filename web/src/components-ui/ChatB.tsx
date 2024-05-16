import { HiSpeakerWave } from "react-icons/hi2"

export const ChatB = () => {
    return (
        <div className="flex items-center gap-2 m-3 mx-5">
            <span className="text-xl"><HiSpeakerWave /></span>
            <div className="bg-[#3066BE] rounded-md p-3 text-white w-auto">
                Good morning, sir! 
                Have a nice day!
            </div>
        </div>
    )
}
