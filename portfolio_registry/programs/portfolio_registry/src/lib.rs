use anchor_lang::prelude::*;

declare_id!("B5FqrhXbhsZtcF3u39zvcUkgTV5NWBSy63xjuMNnDsxv");

#[program]
pub mod portfolio_registry {
    use super::*;

    pub fn initialize_portfolio(ctx: Context<InitializePortfolio>) -> Result<()> {
        let portfolio = &mut ctx.accounts.portfolio;
        portfolio.owner = *ctx.accounts.owner.key;
        portfolio.bump = ctx.bumps.portfolio;
        portfolio.items = Vec::new();
        Ok(())
    }

    pub fn add_portfolio_item(
        ctx: Context<AddPortfolioItem>,
        metadata_cid: String
    ) -> Result<()> {
        let portfolio = &mut ctx.accounts.portfolio;
    
        portfolio.items.push(metadata_cid);
        Ok(())
    }
}
#[error_code]
pub enum PortfolioError {
    #[msg("You are not authorized to modify this portfolio")]
    Unauthorized,
}

#[account]
pub struct UserPortfolio {
    pub owner: Pubkey,
    pub bump: u8,
    pub items: Vec<String>, 
}

#[derive(Accounts)]
pub struct InitializePortfolio<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [b"portfolio", owner.key().as_ref()],
        bump,
        space = 8 + 32 + (4 + 512 * 10)
    )]
    pub portfolio: Account<'info, UserPortfolio>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct AddPortfolioItem<'info> {
    #[account(
        mut,
        seeds = [b"portfolio", owner.key().as_ref()],
        bump = portfolio.bump, 
        has_one = owner @ PortfolioError::Unauthorized
    )]
    pub portfolio: Account<'info, UserPortfolio>,

    #[account(mut)]
    pub owner: Signer<'info>,
}


