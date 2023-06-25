

export default function History() {
    return (
        <div className="overflow-x-auto">
            <h1 className='text-xl '>Trade History</h1>
            <table className="table mt-10">
                {/* head */}
                <thead>
                    <tr>
                        <th></th>
                        <th>Time</th>
                        <th>From</th>
                        <th>Value</th>
                        <th>To</th>
                        <th>Value</th>
                        <th>State</th>
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <th>1</th>
                        <td>04-02 10:10:11</td>
                        <td>USDC</td>
                        <td>1800</td>
                        <td>ETH</td>
                        <td>1</td>
                        <td><button className="btn btn-success">Success</button></td>
                    </tr>

                    <tr>
                        <th>2</th>
                        <td>04-02 10:10:11</td>
                        <td>USDC</td>
                        <td>1800</td>
                        <td>ETH</td>
                        <td>1</td>
                        <td><button className="btn btn-warning">On-Sell</button></td>
                    </tr>

                </tbody>

            </table>

            <div className="join float-right">
                <button className="join-item btn">«</button>
                <button className="join-item btn">Page 22</button>
                <button className="join-item btn">»</button>
            </div>

        </div>
    )
}