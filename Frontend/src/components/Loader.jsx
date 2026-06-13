import React from 'react'

const Loader = ({ fullscreen = false, text = "Loading...", subtext = "" }) => {
    if (fullscreen) {
        return (
            <main className='loader-fullscreen'>
                <div className='loader-content'>
                    <div className='loading-spinner'>
                        <div className='loading-spinner__ring' />
                        <div className='loading-spinner__ring loading-spinner__ring--delay' />
                    </div>
                    {text && <h2 className='loader-title'>{text}</h2>}
                    {subtext && <p className='loader-sub'>{subtext}</p>}
                </div>
            </main>
        )
    }

    return (
        <div className='loader-inline'>
            <div className='loading-spinner loading-spinner--sm'>
                <div className='loading-spinner__ring' />
                <div className='loading-spinner__ring loading-spinner__ring--delay' />
            </div>
            {text && <span className='loader-inline__text'>{text}</span>}
        </div>
    )
}

export default Loader